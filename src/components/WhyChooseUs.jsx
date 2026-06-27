import React from 'react';
import './WhyChooseUs.css';

const ADVANTAGES = [
   {
  
    title: "Exceptional Guest Experience",
    desc: "We believe every guest deserves more than just accommodation. Lulu Aurelian creates memorable stays through comfort, security, convenience, and personalized hospitality in the heart of Nyeri Town."
},
{
     
    title: "Luxury Designed for Modern Travelers",
    desc: "From premium bedding and high-speed Wi-Fi to professionally curated interiors and spotless spaces, every detail is crafted to provide the perfect Airbnb experience for business and leisure guests."
},
{
  
    title: "Premium Accommodation in Nyeri",
    desc: "Stay in stylish, secure, and centrally located Airbnb apartments in Nyeri Town with easy access to local attractions, restaurants, business hubs, and breathtaking views of Mount Kenya."
}
];

export default function WhyChooseUs() {
  return (
    <section className="why-us-section" id="why-us">
      <div className="container">
         <div className="section-title-wrapper">
          <span className="section-tagline"> Your Home Away From Home</span>
          <h2 className="section-title">Where Comfort Meets Exceptional Hospitality</h2> 
          <p className="section-subtitle" id='about-desc'>
            Experience the finest luxury Airbnb apartments in Nyeri Town. We blend elegant interiors, premium amenities, and absolute privacy to provide the perfect accommodation for short-term and extended stays.
          </p>
        </div>
 
        <div className="luxury-features-grid">
          {ADVANTAGES.map((adv, idx) => (
            <div key={idx} className={`adv-card animate-slide-up card-${idx + 1}`} style={{ animationDelay: `${idx * 0.1}s` }}>
              <div className="card-watermark">0{idx + 1}</div>
               
              <h3 className="adv-title">{adv.title}</h3>
              <p className="adv-desc">{adv.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
