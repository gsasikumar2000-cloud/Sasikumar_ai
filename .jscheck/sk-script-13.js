

function openEducationFolder(){
  const oldBox = document.getElementById("sasikumarEducationPanel");
  if(oldBox){
    oldBox.scrollIntoView({behavior:"smooth"});
    return;
  }

  const box = document.createElement("section");
  box.id = "sasikumarEducationPanel";
  box.style.cssText =
    "margin:20px 0;padding:16px;border-radius:16px;background:#111;color:#fff;";

  box.innerHTML = `
    <h2>📚 EDUCATION DETAILS</h2>

    <h3>🏫 School Education</h3>
    <p>Class 1 • Class 2 • Class 3 • Class 4 • Class 5 • Class 6 • Class 7 • Class 8 • Class 9 • Class 10 • Class 11 • Class 12</p>

    <h3>📖 Main Subjects</h3>
    <p>Tamil • English • Mathematics • Physics • Chemistry • Biology • Science • Social Science • History • Geography • Civics • Economics • Computer Science</p>

    <h3>🧮 Mathematics & Equations</h3>
    <p>Arithmetic • Fractions • Decimals • Algebra • Geometry • Mensuration • Trigonometry • Statistics • Probability • Important Formulas • Old Equations</p>

    <h3>🔬 Science</h3>
    <p>Physics Concepts • Chemistry Basics • Biology • Human Body • Plants & Animals • Environment • Practical Science</p>

    <h3>💻 Computer & Technology</h3>
    <p>Computer Basics • Internet Basics • Programming Fundamentals • AI Basics • Cyber Safety • Digital Skills</p>

    <h3>📝 Study & Exam Preparation</h3>
    <p>Chapter Notes • Important Questions • Previous Questions • Practice Tests • Revision • Quick Notes • Exam Preparation • Doubt Clarification</p>

    <h3>🎓 Higher Education</h3>
    <p>Diploma • ITI • Polytechnic • Undergraduate Courses • Postgraduate Courses • Skill Development • Career Guidance</p>

    <button type="button" onclick="window.open('/education/equations.html','_blank')">
      🧮 Open Equations
    </button>

    <button type="button" onclick="alert('Ask SASIKUMAR AI in Tamil or English for step-by-step education help.')">
      🤖 Ask SASIKUMAR AI
    </button>
  `;

  const target = document.getElementById("allJobs");
  if(target) target.parentNode.insertBefore(box, target);
  else document.body.appendChild(box);

  box.scrollIntoView({behavior:"smooth"});
}
