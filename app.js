const API = "https://script.google.com/macros/s/AKfycbz6jVshsaKlkw5-9UIQ1GfFkE9EHJi79d-fupYvOYgbGDMypDCkrbfUij-f-VRz2NYZ/exec";
const UPI_VPA = "9205713725@paytm";

let TOKEN = localStorage.getItem("BKU_TOKEN") || "";

/* API helpers */
async function GET(path){
  const r = await fetch(`${API}?path=${path}`);
  return r.json();
}
async function POST(path,body){
  const r = await fetch(`${API}?path=${path}`,{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(body)
  });
  return r.json();
}

/* UPI donation */
function upiIntent(){
  let amt = document.getElementById("d-amount").value;
  window.location.href=`upi://pay?pa=${UPI_VPA}&pn=BKU&am=${amt}&cu=INR`;
}

/* OTP */
async function sendOtp(){
  let email=document.getElementById("m-email").value;
  let name=document.getElementById("m-name").value;
  let mobile=document.getElementById("m-mobile").value;

  let res = await POST("auth.sendotp",{email,name,mobile});
  document.getElementById("m-msg").innerHTML = res.ok?"OTP भेजा गया":"Error";
}

async function verifyOtp(){
  let email=document.getElementById("m-email").value;
  let code=document.getElementById("m-otp").value;

  let res = await POST("auth.verifyotp",{email,code});
  if(res.ok){
    TOKEN=res.token;
    localStorage.setItem("BKU_TOKEN",TOKEN);
    document.getElementById("m-msg").innerHTML="Login सफल";
  }
}

/* Membership */
async function registerMember(){
  let p={
    token:TOKEN,
    name:document.getElementById("m-name").value,
    email:document.getElementById("m-email").value,
    mobile:document.getElementById("m-mobile").value,
    altMobile:document.getElementById("m-alt").value,
    state:document.getElementById("m-state").value,
    district:document.getElementById("m-district").value,
    city:document.getElementById("m-city").value
  };
  let res=await POST("member.register",p);
  document.getElementById("m-msg").innerHTML=res.ok?"सदस्यता बनी":"Error";
}

/* Load data */
async function loadLookups(){
  let r=await GET("states");
  let st=document.getElementById("m-state");
  let dt=document.getElementById("m-district");

  r.data.states.forEach(s=>{
    let o=document.createElement("option"); o.value=s;o.textContent=s;st.appendChild(o);
  });

  st.addEventListener("change",()=>{
    dt.innerHTML="";
    let list = st.value==="ALL STATES"? 
      Object.values(r.data.map).flat() : 
      r.data.map[st.value];
    list.forEach(d=>{
      let o=document.createElement("option"); o.value=d;o.textContent=d;dt.appendChild(o);
    });
  });

  st.dispatchEvent(new Event("change"));
}

async function loadNews(){
  let r=await GET("news");
  document.getElementById("newsList").innerHTML = 
    r.data.map(n=>`<div class="card"><h3>${n.title}</h3>${n.image||""}<p>${n.body}</p></div>`).join("");
}
async function loadGallery(){
  let r=await GET("gallery");
  document.getElementById("galList").innerHTML = 
    r.data.map(g=>`${g.image}`).join("");
}
async function loadLeaders(){
  let r=await GET("leaders");
  document.getElementById("leadList").innerHTML = 
    r.data.map(l=>`<div class="card"><h3>${l.name}</h3><p>${l.role}</p></div>`).join("");
}

loadLookups();
loadNews();
loadGallery();
loadLeaders();
