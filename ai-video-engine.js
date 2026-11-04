import { v2 as cloudinary } from 'cloudinary';

const FAL_ENDPOINT =
  'https://queue.fal.run/minimax/h3-max-turbo/text-to-video';

const FAL_PRICE_PER_SECOND = 0.015;

// SK_IMAGE_TO_VIDEO_CLOUDINARY_V1
function skCloudinaryReady() {
  if (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  ) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true
    });
  }

  const config = cloudinary.config();
  return Boolean(config.cloud_name && config.api_key && config.api_secret);
}

async function skCloudinaryUploadBuffer(buffer, options = {}) {
  if (!skCloudinaryReady()) {
    throw new Error('Cloudinary is not configured.');
  }

  if (!Buffer.isBuffer(buffer) || !buffer.length) {
    throw new Error('Upload buffer is empty.');
  }

  return await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder || 'sasikumar-ai',
        resource_type: options.resourceType || 'image',
        ...options.uploadOptions
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result?.secure_url) {
          return reject(new Error('Cloudinary returned no secure URL.'));
        }
        resolve(result);
      }
    );

    stream.on('error', reject);
    stream.end(buffer);
  });
}
// END SK_IMAGE_TO_VIDEO_CLOUDINARY_V1



// SK_IMAGE_TO_VIDEO_CLOUDINARY_STORAGE_V1
function skSafeFalMediaUrl(value) {
  try {
    const url = new URL(value);
    return (
      url.protocol === 'https:' &&
      (url.hostname === 'fal.media' ||
       url.hostname.endsWith('.fal.media')) &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}

async function skDownloadFalMp4(value) {
  if (!skSafeFalMediaUrl(value)) {
    throw new Error('Unsafe video download URL.');
  }

  const response = await fetch(value, {
    redirect: 'error',
    signal: AbortSignal.timeout(60000)
  });

  if (!response.ok || !response.body) {
    throw new Error('Could not download generated MP4.');
  }

  const maxBytes = 100 * 1024 * 1024;
  const contentLength = Number(
    response.headers.get('content-length') || 0
  );

  if (contentLength > maxBytes) {
    throw new Error('Generated video exceeds 100 MB.');
  }

  const reader = response.body.getReader();
  const chunks = [];
  let totalBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      totalBytes += value.length;

      if (totalBytes > maxBytes) {
        await reader.cancel();
        throw new Error('Generated video exceeds 100 MB.');
      }

      chunks.push(Buffer.from(value));
    }
  } finally {
    reader.releaseLock();
  }

  const buffer = Buffer.concat(chunks);

  if (
    buffer.length < 12 ||
    buffer.toString('ascii', 4, 8) !== 'ftyp'
  ) {
    throw new Error('Downloaded file is not a valid MP4.');
  }

  return buffer;
}
// END SK_IMAGE_TO_VIDEO_CLOUDINARY_STORAGE_V1

function safeQueueUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' &&
      url.hostname === 'queue.fal.run' &&
      !url.username &&
      !url.password
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

export function registerVideoEngine(app, { pool, auth }) {
  if (!pool || !auth?.requireAuth) {
    throw new Error('Video Engine requires database and authentication.');
  }


const FAL_IMAGE_ENDPOINT =
  'https://queue.fal.run/minimax/h3-max-turbo/image-to-video';

function skDecodeImageData(value) {
  let input = String(value || '').trim();

  if (input.startsWith('data:')) {
    const match = input.match(
      /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/i
    );
    if (!match) throw new Error('Invalid image data URL.');
    input = match[2];
  }

  if (!input || input.length > 12 * 1024 * 1024) {
    throw new Error('Image exceeds the allowed size.');
  }

  const buffer = Buffer.from(input, 'base64');

  if (!buffer.length || buffer.length > 8 * 1024 * 1024) {
    throw new Error('Image must be between 1 byte and 8 MB.');
  }

  let mime = '';

  if (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    mime = 'image/jpeg';
  } else if (
    buffer.length >= 8 &&
    buffer.subarray(0, 8).equals(
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
    )
  ) {
    mime = 'image/png';
  } else if (
    buffer.length >= 12 &&
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  ) {
    mime = 'image/webp';
  }

  if (!mime) throw new Error('Only JPEG, PNG and WebP images are supported.');

  return { buffer, mime };
}


  // SK_IMAGE_TO_VIDEO_SUBMIT_V1
  app.post('/api/ai/video/image', auth.requireAuth, async (req, res) => {
    let jobId;

    try {
      if (process.env.AI_VIDEO_ENABLED !== 'true') {
        return res.status(503).json({
          ok: false,
          code: 'VIDEO_DISABLED',
          message: 'AI Video generation is currently disabled.'
        });
      }

      if (req.body?.confirmPaid !== true) {
        return res.status(400).json({
          ok: false,
          code: 'PAID_CONFIRMATION_REQUIRED',
          message: 'Explicit paid-generation confirmation is required.'
        });
      }

      const apiKey = process.env.FAL_KEY;
      if (!apiKey) {
        return res.status(503).json({
          ok: false,
          message: 'Video provider is not configured.'
        });
      }

      const prompt = String(req.body?.prompt || '').trim();
      if (prompt.length < 5 || prompt.length > 1500) {
        return res.status(400).json({
          ok: false,
          message: 'Prompt must contain 5 to 1500 characters.'
        });
      }

      const duration = Number(req.body?.duration || 5);
      if (duration !== 5) {
        return res.status(400).json({
          ok: false,
          message: 'Initial version supports 5-second videos only.'
        });
      }

      let image;
      try {
        image = skDecodeImageData(
          req.body?.imageData || req.body?.imageBase64
        );
      } catch (error) {
        return res.status(400).json({
          ok: false,
          message: error.message
        });
      }

      jobId = cryptoRandomUUID();

      await pool.query(
        `INSERT INTO public.video_jobs
          (job_id, user_id, platform, input_type, prompt, provider,
           status, duration_seconds)
         VALUES ($1, $2, 'website', 'image', $3, 'fal', 'queued', $4)`,
        [jobId, req.authUser.id, prompt, duration]
      );

      const uploaded = await skCloudinaryUploadBuffer(image.buffer, {
        folder: 'sasikumar-ai/video-inputs',
        resourceType: 'image',
        uploadOptions: {
          public_id: jobId + '-input',
          overwrite: false,
          allowed_formats: ['jpg', 'jpeg', 'png', 'webp']
        }
      });

      const imageUrl = new URL(uploaded.secure_url);
      if (
        imageUrl.protocol !== 'https:' ||
        !imageUrl.hostname.endsWith('cloudinary.com')
      ) {
        throw new Error('Cloudinary returned an invalid image URL.');
      }

      const providerResponse = await fetch(FAL_IMAGE_ENDPOINT, {
        method: 'POST',
        headers: {
          Authorization: `Key ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt,
          image_url: uploaded.secure_url,
          duration,
          resolution: '480P',
          enable_safety_checker: true,
          prompt_expansion_mode: 'balanced'
        }),
        signal: AbortSignal.timeout(30000)
      });

      const providerData = await providerResponse.json().catch(() => ({}));

      if (!providerResponse.ok || !providerData.request_id) {
        throw new Error(
          `Image-to-video submission failed (${providerResponse.status}).`
        );
      }

      const statusUrl = safeQueueUrl(providerData.status_url);
      const responseUrl = safeQueueUrl(providerData.response_url);

      if (!statusUrl || !responseUrl) {
        throw new Error('Provider returned an invalid queue URL.');
      }

      await pool.query(
        `UPDATE public.video_jobs
         SET provider_request_id = $1,
             status = 'processing',
             metadata = metadata || $2::jsonb,
             updated_at = NOW()
         WHERE job_id = $3 AND user_id = $4`,
        [
          providerData.request_id,
          JSON.stringify({
            status_url: statusUrl,
            response_url: responseUrl,
            input_image_url: uploaded.secure_url,
            input_image_public_id: uploaded.public_id
          }),
          jobId,
          req.authUser.id
        ]
      );

      return res.status(202).json({
        ok: true,
        jobId,
        status: 'processing',
        inputType: 'image',
        duration,
        resolution: '480P',
        estimatedCostUSD: Number(
          (duration * FAL_PRICE_PER_SECOND).toFixed(3)
        ),
        message: 'Image-to-video job has been submitted.'
      });

    } catch (error) {
      console.error('[AI Image-to-Video submit]', error.message);

      if (jobId) {
        await pool.query(
          `UPDATE public.video_jobs
           SET status = 'failed',
               error_message = $1,
               updated_at = NOW()
           WHERE job_id = $2 AND user_id = $3`,
          [
            String(error.message).slice(0, 500),
            jobId,
            req.authUser.id
          ]
        ).catch(() => {});
      }

      return res.status(502).json({
        ok: false,
        message: 'Could not submit the image-to-video job.',
        jobId: jobId || undefined
      });
    }
  });
  // END SK_IMAGE_TO_VIDEO_SUBMIT_V1

// Create a paid AI video job.
  app.post('/api/ai/video', auth.requireAuth, async (req, res) => {
    let jobId;

    try {
      if (process.env.AI_VIDEO_ENABLED !== 'true') {
        return res.status(503).json({
          ok: false,
          code: 'VIDEO_DISABLED',
          message: 'AI Video generation is currently disabled.'
        });
      }

      if (req.body?.confirmPaid !== true) {
        return res.status(400).json({
          ok: false,
          code: 'PAID_CONFIRMATION_REQUIRED',
          message: 'Explicit paid-generation confirmation is required.'
        });
      }

      const apiKey = process.env.FAL_KEY;

      if (!apiKey) {
        return res.status(503).json({
          ok: false,
          message: 'Video provider is not configured.'
        });
      }

      const prompt = String(req.body?.prompt || '').trim();

      if (prompt.length < 5 || prompt.length > 1500) {
        return res.status(400).json({
          ok: false,
          message: 'Prompt must contain 5 to 1500 characters.'
        });
      }

      const duration = Number(req.body?.duration || 5);

      if (![5].includes(duration)) {
        return res.status(400).json({
          ok: false,
          message: 'Initial version supports 5-second videos only.'
        });
      }

      const aspectRatio = String(req.body?.aspectRatio || '16:9');

      if (!['21:9', '16:9', '4:3', '1:1', '3:4', '9:16'].includes(aspectRatio)) {
        return res.status(400).json({
          ok: false,
          message: 'Invalid aspect ratio.'
        });
      }

      jobId = cryptoRandomUUID();

      await pool.query(
        `INSERT INTO public.video_jobs
          (job_id, user_id, platform, input_type, prompt, provider,
           status, duration_seconds)
         VALUES ($1, $2, 'website', 'text', $3, 'fal',
                 'queued', $4)`,
        [jobId, req.authUser.id, prompt, duration]
      );

      const providerResponse = await fetch(FAL_ENDPOINT, {
        method: 'POST',
        headers: {
          Authorization: `Key ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt,
          duration,
          resolution: '480P',
          aspect_ratio: aspectRatio,
          enable_safety_checker: true,
          prompt_expansion_mode: 'balanced'
        }),
        signal: AbortSignal.timeout(30000)
      });

      const providerData = await providerResponse.json().catch(() => ({}));

      if (!providerResponse.ok || !providerData.request_id) {
        throw new Error(
          `Video provider submission failed (${providerResponse.status}).`
        );
      }

      const statusUrl = safeQueueUrl(providerData.status_url);
      const responseUrl = safeQueueUrl(providerData.response_url);

      if (!statusUrl || !responseUrl) {
        throw new Error('Video provider returned an invalid queue URL.');
      }

      await pool.query(
        `UPDATE public.video_jobs
         SET provider_request_id = $1,
             status = 'processing',
             metadata = metadata || $2::jsonb,
             updated_at = NOW()
         WHERE job_id = $3 AND user_id = $4`,
        [
          providerData.request_id,
          JSON.stringify({ status_url: statusUrl, response_url: responseUrl }),
          jobId,
          req.authUser.id
        ]
      );

      return res.status(202).json({
        ok: true,
        jobId,
        status: 'processing',
        duration,
        resolution: '480P',
        estimatedCostUSD: Number(
          (duration * FAL_PRICE_PER_SECOND).toFixed(3)
        ),
        message: 'Video generation has been submitted.'
      });

    } catch (error) {
      console.error('[AI Video submit]', error.message);

      if (jobId) {
        await pool.query(
          `UPDATE public.video_jobs
           SET status = 'failed', error_message = $1,
               updated_at = NOW()
           WHERE job_id = $2 AND user_id = $3`,
          [
            String(error.message).slice(0, 500),
            jobId,
            req.authUser.id
          ]
        ).catch(() => {});
      }

      return res.status(502).json({
        ok: false,
        message: 'Could not submit the video job.',
        jobId: jobId || undefined
      });
    }
  });

  // Check a job belonging to the logged-in user.
  app.get('/api/ai/video/:jobId', auth.requireAuth, async (req, res) => {
    try {
      const found = await pool.query(
        `SELECT job_id, status, input_type, provider_request_id, video_url,
                error_message, duration_seconds, metadata,
                created_at, completed_at
         FROM public.video_jobs
         WHERE job_id = $1 AND user_id = $2
         LIMIT 1`,
        [req.params.jobId, req.authUser.id]
      );

      if (!found.rows.length) {
        return res.status(404).json({
          ok: false,
          message: 'Video job not found.'
        });
      }

      const job = found.rows[0];

      if (job.status === 'processing') {
        const statusUrl = safeQueueUrl(job.metadata?.status_url);
        const responseUrl = safeQueueUrl(job.metadata?.response_url);

        if (statusUrl && responseUrl) {
          const statusResponse = await fetch(statusUrl, {
            headers: { Authorization: `Key ${process.env.FAL_KEY || ''}` },
            signal: AbortSignal.timeout(20000)
          });

          const providerStatus = await statusResponse.json().catch(() => ({}));

          if (!statusResponse.ok) {
            throw new Error('Could not check video provider status.');
          }

          if (providerStatus.status === 'COMPLETED') {
            const resultResponse = await fetch(responseUrl, {
              headers: { Authorization: `Key ${process.env.FAL_KEY || ''}` },
              signal: AbortSignal.timeout(20000)
            });

            const result = await resultResponse.json().catch(() => ({}));

            if (!resultResponse.ok) {
              throw new Error('Could not retrieve completed video result.');
            }

            const videoUrl = result.video?.url;

            if (!skSafeFalMediaUrl(videoUrl)) {
              throw new Error('Provider returned an invalid video URL.');
            }

            let storedVideoUrl = videoUrl;

            if (job.input_type === 'image') {
              const mp4Buffer = await skDownloadFalMp4(videoUrl);

              const uploadedVideo = await skCloudinaryUploadBuffer(
                mp4Buffer,
                {
                  folder: 'sasikumar-ai/generated-videos',
                  resourceType: 'video',
                  uploadOptions: {
                    public_id: job.job_id + '-output',
                    overwrite: true
                  }
                }
              );

              const cloudinaryUrl = new URL(uploadedVideo.secure_url);

              if (
                cloudinaryUrl.protocol !== 'https:' ||
                !cloudinaryUrl.hostname.endsWith('cloudinary.com')
              ) {
                throw new Error('Cloudinary returned an invalid video URL.');
              }

              storedVideoUrl = uploadedVideo.secure_url;
            }

            await pool.query(
              `UPDATE public.video_jobs
               SET status = 'completed', video_url = $1,
                   completed_at = NOW(), updated_at = NOW()
               WHERE job_id = $2 AND user_id = $3`,
              [storedVideoUrl, job.job_id, req.authUser.id]
            );

            job.status = 'completed';
            job.video_url = storedVideoUrl;
          } else if (providerStatus.status === 'FAILED') {
            const message = String(
              providerStatus.error || 'Video generation failed.'
            ).slice(0, 500);

            await pool.query(
              `UPDATE public.video_jobs
               SET status = 'failed', error_message = $1,
                   updated_at = NOW()
               WHERE job_id = $2 AND user_id = $3`,
              [message, job.job_id, req.authUser.id]
            );

            job.status = 'failed';
            job.error_message = message;
          }
        }
      }

      return res.json({
        ok: true,
        jobId: job.job_id,
        status: job.status,
        videoUrl: job.video_url || null,
        error: job.error_message || null,
        duration: job.duration_seconds,
        createdAt: job.created_at,
        completedAt: job.completed_at
      });

    } catch (error) {
      console.error('[AI Video status]', error.message);

      return res.status(502).json({
        ok: false,
        message: 'Could not check video status.'
      });
    }
  });
}

function cryptoRandomUUID() {
  return globalThis.crypto.randomUUID();
}
