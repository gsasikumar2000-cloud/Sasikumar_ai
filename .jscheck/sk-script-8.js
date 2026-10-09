

async function sasikumarLogin() {
  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value;
  const msg = document.getElementById("loginMessage");

  if (!username || !password) {
    msg.textContent = "⚠️ Username மற்றும் Password உள்ளிடுங்கள்.";
    msg.style.color = "#c00";
    return;
  }

  msg.textContent = "⏳ Login checking...";
  msg.style.color = "#555";

  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({username, password})
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      msg.textContent = "❌ Invalid username or password";
      msg.style.color = "#c00";
      return;
    }

    sessionStorage.setItem("sasikumar_logged_in", "true");
    sessionStorage.setItem("sasikumar_role", data.role);
    sessionStorage.setItem("sasikumar_username", data.username);

    document.getElementById("sasikumarLoginScreen").style.display = "none";

    msg.textContent = "";
  } catch (error) {
    console.error(error);
    msg.textContent = "❌ Server connection error";
    msg.style.color = "#c00";
  }
}

function showSignupForm() {
  document.getElementById("signupBox").style.display = "block";
  document.getElementById("signupMessage").textContent = "";
}

function hideSignupForm() {
  document.getElementById("signupBox").style.display = "none";
  document.getElementById("signupMessage").textContent = "";
}

async function sasikumarSignup() {
  const username = document.getElementById("signupUsername").value.trim();
  const password = document.getElementById("signupPassword").value;
  const confirm = document.getElementById("signupConfirm").value;
  const msg = document.getElementById("signupMessage");

  if (!username || !password || !confirm) {
    msg.textContent = "⚠️ All fields are required.";
    msg.style.color = "#c00";
    return;
  }

  if (username.length < 3 || username.length > 30) {
    msg.textContent = "⚠️ Username must be 3-30 characters.";
    msg.style.color = "#c00";
    return;
  }

  if (password.length < 6) {
    msg.textContent = "⚠️ Password must be at least 6 characters.";
    msg.style.color = "#c00";
    return;
  }

  if (password !== confirm) {
    msg.textContent = "⚠️ Passwords do not match.";
    msg.style.color = "#c00";
    return;
  }

  msg.textContent = "⏳ Creating account...";
  msg.style.color = "#555";

  try {
    const response = await fetch("/api/signup", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({username, password})
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      msg.textContent = "❌ " + (data.message || "Signup failed");
      msg.style.color = "#c00";
      return;
    }

    msg.textContent = "✅ Account created! Please login.";
    msg.style.color = "#15803d";

    document.getElementById("loginUsername").value = username;
    document.getElementById("loginPassword").value = "";
    document.getElementById("signupPassword").value = "";
    document.getElementById("signupConfirm").value = "";

    setTimeout(() => {
      hideSignupForm();
      document.getElementById("loginMessage").textContent = "✅ Account created. Please login.";
      document.getElementById("loginMessage").style.color = "#15803d";
    }, 800);

  } catch (error) {
    console.error(error);
    msg.textContent = "❌ Server connection error";
    msg.style.color = "#c00";
  }
}

(function() {
  const loggedIn = sessionStorage.getItem("sasikumar_logged_in");

  if (loggedIn === "true") {
    document.getElementById("sasikumarLoginScreen").style.display = "none";
  }
})();
function technologyMenu(){
  const chatBox=document.getElementById("chat");
  if(!chatBox) return;

  const loading=document.createElement("div");
  loading.className="msg ai";

  const box=document.createElement("div");
  box.style.whiteSpace="pre-wrap";
  box.textContent=[
    "💻 TECHNOLOGY",
    "",
    "🤖 AI & ChatGPT",
    "📱 Mobile / Android",
    "💻 Computer / Software",
    "🌐 Internet / Websites",
    "🔐 Cyber Safety",
    "🆕 Technology News",
    "🛠️ Tech Troubleshooting"
  ].join("");

  loading.appendChild(box);
  chatBox.appendChild(loading);
  chatBox.scrollTop=chatBox.scrollHeight;
}
