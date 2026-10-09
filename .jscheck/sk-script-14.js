

(function(){

  const KEY = 'sasikumarEmployerJobs';

  function jobs(){
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || '[]');

      if(!Array.isArray(raw)) return [];

      const valid = raw.filter(j =>
        j &&
        typeof j === 'object' &&
        String(j.id || '').trim() &&
        String(j.company || '').trim() &&
        String(j.title || '').trim()
      );

      if(valid.length !== raw.length){
        localStorage.setItem(KEY, JSON.stringify(valid));
      }

      return valid;
    } catch(e) {
      console.error('Job storage read error:', e);
      return [];
    }
  }

  function save(list){
    try{
      localStorage.setItem(KEY, JSON.stringify(list));
      console.log('✅ Jobs saved. Poster images:',
        Array.isArray(list) ? list.filter(j => j && j.posterImage).length : 0
      );
      return true;
    }catch(e){
      console.error('Job storage save failed:', e);
      alert('⚠️ Job could not be saved because browser storage is full. Please use a smaller poster image.');
      return false;
    }
  }

  function esc(value){
    return String(value || '')
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;')
      .replace(/'/g,'&#039;');
  }

  function hideAll(){
    [
      'sjEmployerForm',
      'sjCamera',
      'sjUpload',
      'sjMessageBox',
      'sjLiveSearch'
    ].forEach(id => {
      const el = document.getElementById(id);
      if(el) el.style.display='none';
    });
  }

  function openBox(id){
    hideAll();
    const el=document.getElementById(id);
    if(el){
      el.style.display='block';
      el.scrollIntoView({behavior:'smooth',block:'start'});
    }
  }

  window.showEmployerJobForm=function(){
    openBox('sjEmployerForm');
  };

  window.showJobCamera=function(){
    openBox('sjCamera');
  };

  window.showJobUpload=function(){
    openBox('sjUpload');
  };

  window.showJobMessage=function(){
    openBox('sjMessageBox');
  };

  window.showLiveJobSearch=function(){
    openBox('sjLiveSearch');
    renderSasikumarJobs();
  };

  function makeId(){
    return 'JOB-' + Date.now() + '-' +
      Math.random().toString(36).slice(2,7).toUpperCase();
  }

  function readImage(file, callback){
    if(!file){
      callback('');
      return;
    }

    if(!file.type.startsWith('image/')){
      callback('');
      return;
    }

    const reader=new FileReader();

    reader.onload=function(e){
      callback(e.target.result || '');
    };

    reader.onerror=function(){
      callback('');
    };

    reader.readAsDataURL(file);
  }

  function normalizeWhatsApp(value){
    let n=String(value || '').replace(/\D/g,'');

    if(n.length===10){
      n='91'+n;
    }

    return n;
  }

  function expireJobs(){
    const list=jobs();
    const today=new Date();
    today.setHours(0,0,0,0);

    let changed=false;

    list.forEach(job=>{
      if(job.status==='LIVE' && job.closingDate){
        const close=new Date(job.closingDate+'T23:59:59');

        if(close.getTime() < Date.now()){
          job.status='EXPIRED';
          changed=true;
        }
      }
    });

    if(changed) save(list);

    return list;
  }

  function compressJobPoster(file, callback){
    if(!file || !file.type.startsWith('image/')){
      callback('');
      return;
    }

    const reader=new FileReader();

    reader.onload=function(e){
      const img=new Image();

      img.onload=function(){
        const maxW=1000;
        const scale=Math.min(1,maxW/img.width);

        const canvas=document.createElement('canvas');
        canvas.width=Math.max(1,Math.round(img.width*scale));
        canvas.height=Math.max(1,Math.round(img.height*scale));

        const ctx=canvas.getContext('2d');
        ctx.drawImage(img,0,0,canvas.width,canvas.height);

        const data=canvas.toDataURL('image/jpeg',0.78);
        callback(data);
      };

      img.onerror=function(){
        console.error('Job poster image decode failed.');
        callback('');
      };

      img.src=e.target.result;
    };

    reader.onerror=function(){
      console.error('Job poster FileReader failed.');
      callback('');
    };

    reader.readAsDataURL(file);
  }

  window.submitSasikumarJob=function(){

    const company=document.getElementById('sjCompany').value.trim();
    const title=document.getElementById('sjTitle').value.trim();
    const type=document.getElementById('sjType').value;
    const location=document.getElementById('sjLocation').value.trim();
    const whatsapp=document.getElementById('sjWhatsapp').value.trim();
    const closingDate=document.getElementById('sjClosingDate').value;

    if(!company || !title || !type || !location || !whatsapp){
      alert('Company, Job Title, Job Type, Location and WhatsApp are required.');
      return;
    }

    if(!closingDate){
      alert('Please select Job Closing Date.');
      return;
    }

    const closeTime=new Date(closingDate+'T23:59:59').getTime();

    if(closeTime < Date.now()){
      alert('Closing Date must be today or a future date.');
      return;
    }

    const cameraFile=document.getElementById('sjCameraFile')?.files?.[0];
    const uploadFile=document.getElementById('sjUploadFile')?.files?.[0];
    const posterFile=uploadFile || cameraFile;

    const job={
      id:makeId(),
      company,
      title,
      type,
      qualification:document.getElementById('sjQualification').value.trim(),
      experience:document.getElementById('sjExperience').value.trim(),
      vacancies:document.getElementById('sjVacancies').value.trim(),
      salary:document.getElementById('sjSalary').value.trim(),
      location,
      hours:document.getElementById('sjHours').value.trim(),
      whatsapp:normalizeWhatsApp(whatsapp),
      description:document.getElementById('sjDescription').value.trim(),
      requirements:document.getElementById('sjRequirements').value.trim(),
      message:document.getElementById('sjMessage').value.trim(),
      closingDate,
      posterImage:'',
      status:'LIVE',
      createdAt:new Date().toISOString()
    };

    const finish=function(){
      const list=jobs();
      list.push(job);
      save(list);

      document.getElementById('sjSubmitResult').innerHTML=
        '<div style="padding:12px;border-radius:10px;background:#222;">' +
        '✅ <b>Job Post Submitted</b><br>' +
        '🟢 Status: LIVE<br>' +
        '🆔 Job ID: '+esc(job.id)+'<br>' +
        '📅 Closing Date: '+esc(job.closingDate) +
        '</div>';

      renderSasikumarJobs();
    };

    if(posterFile){
      compressJobPoster(posterFile,function(data){
        job.posterImage=data || '';

        console.log('JOB POSTER DEBUG:', {
          hasImage: !!job.posterImage,
          imageLength: job.posterImage.length,
          imageType: job.posterImage.slice(0,30)
        });

        finish();
      });
    }else{
      finish();
    }
  };

  window.submitCameraJob=function(){

    const file=document.getElementById('sjCameraStandalone')?.files?.[0];

    if(!file){
      alert('Please capture/select a camera image first.');
      return;
    }

    const preview=document.getElementById('sjPosterPreview');

    readImage(file,function(data){

      if(preview && data){
        preview.src=data;
        preview.style.display='block';
      }

      document.getElementById('sjCameraResult').innerHTML=
        '📷 Camera image ready. You can use Employer Register → Submit Post to publish it.';
    });
  };

  window.submitUploadJob=function(){

    const file=document.getElementById('sjUploadStandalone')?.files?.[0];

    if(!file){
      alert('Please select an image or PDF first.');
      return;
    }

    if(file.type==='application/pdf'){
      document.getElementById('sjUploadResult').innerHTML=
        '📄 PDF selected: '+esc(file.name)+'<br>' +
        'Use Employer Register → Submit Post for the job details.';
      return;
    }

    readImage(file,function(data){

      const preview=document.getElementById('sjPosterPreview');

      if(preview && data){
        preview.src=data;
        preview.style.display='block';
      }

      document.getElementById('sjUploadResult').innerHTML=
        '✅ Image uploaded and preview ready.';
    });
  };

  window.copySasikumarJobMessage=function(){

    const el=document.getElementById('sjMessageText');

    if(!el || !el.value.trim()){
      alert('Please enter a message first.');
      return;
    }

    if(navigator.clipboard){
      navigator.clipboard.writeText(el.value);
    }else{
      el.select();
      document.execCommand('copy');
    }

    alert('📋 Message copied.');
  };

  window.submitSasikumarJobMessage=function(){

    const text=document.getElementById('sjMessageText').value.trim();

    if(!text){
      alert('Please enter job details.');
      return;
    }

    const data={
      id:makeId(),
      source:'MESSAGE',
      message:text,
      status:'PENDING',
      createdAt:new Date().toISOString()
    };

    const list=jobs();
    list.push(data);
    save(list);

    document.getElementById('sjMessageResult').innerHTML=
      '🟡 Message submitted for screening.<br>' +
      '🆔 '+esc(data.id);
  };

  
// Clean invalid/blank saved jobs before rendering
window.cleanSasikumarJobs=function(){
  try{
    const raw=localStorage.getItem('sasikumarEmployerJobs') || '[]';
    const list=JSON.parse(raw);

    const clean=Array.isArray(list)
      ? list.filter(j =>
          j &&
          typeof j === 'object' &&
          String(j.company || '').trim() &&
          String(j.title || '').trim() &&
          String(j.location || '').trim()
        )
      : [];

    localStorage.setItem('sasikumarEmployerJobs',JSON.stringify(clean));
    return clean;
  }catch(e){
    console.error('Job storage cleanup failed:',e);
    return [];
  }
};

window.renderSasikumarJobs=function(){

  const box=document.getElementById('sjLiveResults');
  if(!box) return;

  const search=(document.getElementById('sjSearch')?.value || '')
    .trim().toLowerCase();

  const list=expireJobs();

  const matches=(job)=>{
    const text=[
      job.company,
      job.title,
      job.location,
      job.qualification,
      job.experience,
      job.type,
      job.description,
      job.requirements
    ].join(' ').toLowerCase();

    return !search || text.includes(search);
  };

  const live=list.filter(j => j.status==='LIVE' && matches(j));

  const screening=list.filter(j =>
    j.status==='PENDING' &&
    matches(j)
  );

  const expired=list.filter(j =>
    j.status==='EXPIRED' &&
    matches(j)
  );

  const countAll=list.length;

  let html=
    '<div style="margin-bottom:12px;padding:12px;border-radius:12px;background:#181818;">' +
    '<b>📊 JOB STATUS</b><br>' +
    '🟢 LIVE: '+list.filter(j=>j.status==='LIVE').length+
    ' &nbsp; 🟡 SCREENING: '+list.filter(j=>j.status==='PENDING').length+
    ' &nbsp; 🔴 EXPIRED: '+list.filter(j=>j.status==='EXPIRED').length+
    ' &nbsp; 📋 TOTAL: '+countAll+
    '</div>';

  if(live.length){

    html +=
      '<h3 style="margin:14px 0 8px;">🟢 LIVE JOB CONTENT</h3>';

    html += live.map(job=>{

      const wa=normalizeWhatsApp(job.whatsapp);

      const waButton=wa
        ? '<button type="button" onclick="connectJobWhatsApp(\''+
          esc(job.id)+
          '\')" style="margin-top:10px;">📱 Connect WhatsApp</button>'
        : '';

      return '<article style="margin:12px 0;padding:16px;border-radius:14px;background:#222;border:1px solid #444;">' +

        (job.posterImage
          ? '<img src="'+job.posterImage+
            '" style="width:100%;max-width:500px;border-radius:12px;margin-bottom:12px;" alt="Job Poster">'
          : '') +

        '<div style="font-size:12px;margin-bottom:6px;">' +
        '🟢 <b>LIVE JOB</b>' +
        '</div>' +

        '<h3 style="margin:6px 0 12px;">💼 '+esc(job.title)+'</h3>' +

        '<b>🏢 Company:</b> '+esc(job.company)+'<br>' +
        '<b>📍 Location:</b> '+esc(job.location)+'<br>' +
        '<b>💼 Job Type:</b> '+esc(job.type || '-')+'<br>' +
        '<b>🎓 Qualification:</b> '+esc(job.qualification || '-')+'<br>' +
        '<b>🧑‍💼 Experience:</b> '+esc(job.experience || '-')+'<br>' +
        '<b>👥 Vacancies:</b> '+esc(job.vacancies || '-')+'<br>' +
        '<b>💰 Salary:</b> '+esc(job.salary || '-')+'<br>' +
        '<b>🕐 Working Hours:</b> '+esc(job.hours || '-')+'<br>' +
        '<b>📅 Closing Date:</b> '+esc(job.closingDate || '-')+'<br>' +

        (job.description
          ? '<div style="margin-top:10px;padding:10px;border-radius:10px;background:#303030;">' +
            '<b>📝 JOB DETAILS</b><br>'+esc(job.description)+
            '</div>'
          : '') +

        (job.requirements
          ? '<div style="margin-top:10px;padding:10px;border-radius:10px;background:#303030;">' +
            '<b>📋 REQUIREMENTS</b><br>'+esc(job.requirements)+
            '</div>'
          : '') +

        (job.message
          ? '<div style="margin-top:10px;padding:10px;border-radius:10px;background:#303030;">' +
            '<b>📰 MESSAGE</b><br>'+esc(job.message)+
            '</div>'
          : '') +

        '<div style="margin-top:10px;font-size:12px;opacity:.8;">' +
        '🆔 Job ID: '+esc(job.id)+
        '</div>' +

        waButton +

        '</article>';

    }).join('');

  }else{

    html +=
      '<div style="padding:15px;border-radius:10px;background:#222;">' +
      '🔎 No LIVE jobs found.' +
      '</div>';

  }

  if(screening.length){

    html +=
      '<h3 style="margin:18px 0 8px;">🟡 SCREENING</h3>';

    html += screening.map(job=>
      '<div style="margin:10px 0;padding:14px;border-radius:12px;background:#332b10;">' +
      '🟡 <b>Employer Post Under Screening</b><br>' +
      '🆔 '+esc(job.id)+'<br>' +
      '📝 '+esc(job.message || 'Job information submitted for screening.') +
      '</div>'
    ).join('');

  }

  if(expired.length){

    html +=
      '<h3 style="margin:18px 0 8px;">🔴 EXPIRED JOBS</h3>';

    html += expired.map(job=>
      '<div style="margin:10px 0;padding:14px;border-radius:12px;background:#2b1818;">' +
      '🔴 <b>'+esc(job.title)+'</b><br>' +
      '🏢 '+esc(job.company)+'<br>' +
      '📍 '+esc(job.location)+'<br>' +
      '📅 Closed: '+esc(job.closingDate || '-') +
      '</div>'
    ).join('');

  }

  box.innerHTML=html;
};

window.connectJobWhatsApp=function(id){

    const job=jobs().find(j=>j.id===id);

    if(!job){
      alert('Job not found.');
      return;
    }

    const wa=normalizeWhatsApp(job.whatsapp);

    if(!wa){
      alert('WhatsApp number is not available.');
      return;
    }

    window.open(
      'https://wa.me/'+wa,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const camera=document.getElementById('sjCameraFile');
  const upload=document.getElementById('sjUploadFile');

  function previewFile(file){

    const preview=document.getElementById('sjPosterPreview');

    if(!preview || !file || !file.type.startsWith('image/')) return;

    readImage(file,function(data){

      if(data){
        preview.src=data;
        preview.style.display='block';
      }

    });
  }

  if(camera){
    camera.addEventListener('change',function(){
      previewFile(this.files?.[0]);
    });
  }

  if(upload){
    upload.addEventListener('change',function(){
      previewFile(this.files?.[0]);
    });
  }

  setInterval(function(){
    if(document.getElementById('sjLiveSearch')?.style.display!=='none'){
      renderSasikumarJobs();
    }else{
      expireJobs();
    }
  },60000);

  window.addEventListener('load',function(){
    expireJobs();
  });

})();
