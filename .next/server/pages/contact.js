"use strict";(()=>{var e={};e.id=364,e.ids=[364],e.modules={3067:(e,t,r)=>{r.a(e,async(e,a)=>{try{r.r(t),r.d(t,{config:()=>u,default:()=>m,getServerSideProps:()=>x,getStaticPaths:()=>g,getStaticProps:()=>c,reportWebVitals:()=>f,routeModule:()=>w,unstable_getServerProps:()=>v,unstable_getServerSideProps:()=>S,unstable_getStaticParams:()=>y,unstable_getStaticPaths:()=>h,unstable_getStaticProps:()=>b});var s=r(3865),o=r(9455),i=r(671),n=r(9407),l=r(2327),p=r(8079),d=e([l,p]);[l,p]=d.then?(await d)():d;let m=(0,i.M)(p,"default"),c=(0,i.M)(p,"getStaticProps"),g=(0,i.M)(p,"getStaticPaths"),x=(0,i.M)(p,"getServerSideProps"),u=(0,i.M)(p,"config"),f=(0,i.M)(p,"reportWebVitals"),b=(0,i.M)(p,"unstable_getStaticProps"),h=(0,i.M)(p,"unstable_getStaticPaths"),y=(0,i.M)(p,"unstable_getStaticParams"),v=(0,i.M)(p,"unstable_getServerProps"),S=(0,i.M)(p,"unstable_getServerSideProps"),w=new s.PagesRouteModule({definition:{kind:o.A.PAGES,page:"/contact",pathname:"/contact",bundlePath:"",filename:""},components:{App:l.default,Document:n.default},userland:p});a()}catch(e){a(e)}})},8079:(e,t,r)=>{r.a(e,async(e,a)=>{try{r.r(t),r.d(t,{default:()=>c});var s=r(8732),o=r(2015),i=r(7919),n=r(6884),l=r(2971),p=r(1415),d=r(8825),m=e([i,n,l,p,d]);[i,n,l,p,d]=m.then?(await m)():m;let g=l.z.object({name:l.z.string().min(2,{message:"Please Enter Your Name"}),email:l.z.string().email({message:"Please Enter a Valid Email Address"}),message:l.z.string().min(10,{message:"Message must be at least 10 characters"})});function c(){let[e,t]=(0,o.useState)(!1),r=(0,n.useForm)({resolver:(0,d.zodResolver)(g),defaultValues:{name:"",email:"",message:""}}),a=async e=>{t(!0);let a=`<div style="font-family: 'Montserrat', sans-serif; background-color: #ffffff; color: #333; padding: 40px; max-width: 700px; margin: auto;">
  <style>
    @media only screen and (max-width: 600px) {
      .container { padding: 20px !important; }
      h1 { font-size: 24px !important; }
      .divider { margin: 24px 0 !important; }
    }
  </style>

  <div style="padding: 40px;">
    <!-- Header -->
    <h1 style="font-size: 32px; font-weight: 800; color: #000; margin: 0 0 32px; letter-spacing: -0.5px;">
      NEW MESSAGE
    </h1>

    <!-- Sender Info -->
    <div style="margin-bottom: 40px;">
      <p style="font-size: 18px; margin: 0 0 8px; font-weight: 600;">
        From ${e.name}
      </p>
      <p style="font-size: 16px; margin: 0; color: #666;">
        <a href="mailto:${e.email}" style="color: #000; text-decoration: none; border-bottom: 2px solid #000;">
          ${e.email}
        </a>
      </p>
    </div>

    <!-- Message Content -->
    <div style="border-left: 3px solid #000; padding-left: 24px; margin-bottom: 40px;">
      <p style="font-size: 18px; line-height: 1.6; margin: 0; color: #444;">
        ${e.message}
      </p>
    </div>

    <!-- Divider -->
    <div class="divider" style="height: 2px; background: #000; margin: 48px 0;"></div>

    <!-- Reply CTA -->
    <a href="mailto:${e.email}" style="display: block; text-decoration: none; text-align: center;">
      <span style="display: inline-block; font-size: 16px; font-weight: 700; color: #000; padding: 16px 48px; border: 2px solid #000; transition: all 0.3s ease;">
        Reply to ${e.name}
      </span>
    </a>
  </div>

  <!-- Footer -->
  <p style="font-size: 12px; color: #999; text-align: center; margin: 40px 0 0; letter-spacing: 0.5px;">
    Sent via contact form • Do not reply to this automated message
  </p>
</div>`;try{if(!(await fetch("/api/send-email",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:e.email,subject:"New Contact Us Form",text:a})})).ok)throw Error("Failed to send message");p.toast.success("Message sent successfully!"),r.reset()}catch(e){p.toast.error(e.message||"An error occurred")}finally{t(!1)}};return(0,s.jsx)(i.A,{children:(0,s.jsx)("div",{className:"min-h-screen flex items-center justify-center bg-gray-50",children:(0,s.jsxs)("div",{className:"w-full max-w-2xl mx-4 bg-white p-12 rounded-none shadow-[0_0_0_1px_rgba(0,0,0,0.1)]",children:[(0,s.jsx)("h2",{className:"text-4xl font-bold text-center text-gray-900 mb-12 tracking-tight",children:"CONTACT US"}),(0,s.jsxs)("form",{onSubmit:r.handleSubmit(a),className:"space-y-10",children:[["name","email","message"].map(e=>(0,s.jsxs)("div",{className:"relative",children:["message"!==e?(0,s.jsx)("input",{...r.register(e),placeholder:"name"===e?"Your Name":"Your Email",className:`w-full px-0 py-3 border-b-2 border-gray-300 
                      focus:border-black focus:ring-0 bg-transparent
                      placeholder-gray-400 text-lg font-medium
                      transition-all duration-200 rounded-none`}):(0,s.jsx)("textarea",{...r.register(e),placeholder:"Your Message",className:`w-full px-0 py-3 border-b-2 border-gray-300 
                      focus:border-black focus:ring-0 bg-transparent
                      placeholder-gray-400 text-lg font-medium resize-none
                      transition-all duration-200 rounded-none h-32`}),r.formState.errors[e]&&(0,s.jsx)("p",{className:"absolute -bottom-6 left-0 text-red-600 text-sm font-medium",children:r.formState.errors[e].message})]},e)),(0,s.jsx)("button",{type:"submit",className:"w-full py-4 border-2 border-black font-bold uppercase tracking-wide flex items-center justify-center transition-all bg-black text-white hover:bg-white hover:text-black focus:bg-white focus:text-black focus:outline-none",disabled:e,children:e?"sending...":"Send Message"})]})]})})})}a()}catch(e){a(e)}})},6472:e=>{e.exports=require("@opentelemetry/api")},361:e=>{e.exports=require("next/dist/compiled/next-server/pages.runtime.prod.js")},2015:e=>{e.exports=require("react")},2326:e=>{e.exports=require("react-dom")},8732:e=>{e.exports=require("react/jsx-runtime")},9021:e=>{e.exports=require("fs")},3873:e=>{e.exports=require("path")},7910:e=>{e.exports=require("stream")},4075:e=>{e.exports=require("zlib")},8825:e=>{e.exports=import("@hookform/resolvers/zod")},9846:e=>{e.exports=import("@vercel/analytics/react")},531:e=>{e.exports=import("@vercel/speed-insights/next")},6551:e=>{e.exports=import("firebase/app")},6958:e=>{e.exports=import("firebase/auth")},4337:e=>{e.exports=import("firebase/firestore")},3220:e=>{e.exports=import("framer-motion")},6338:e=>{e.exports=import("js-cookie")},6884:e=>{e.exports=import("react-hook-form")},1415:e=>{e.exports=import("sonner")},2971:e=>{e.exports=import("zod")}};var t=require("../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),a=t.X(0,[883,44,871,155],()=>r(3067));module.exports=a})();