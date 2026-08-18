import {footerCopyright} from '@/lib/footer.mjs';

export default function AxisFooter({logoSrc, logoAlt='Marca do evento'}) {
  return <footer className="axis-footer">
    {logoSrc&&<img className="axis-footer-logo" src={logoSrc} alt={logoAlt}/>} 
    <div className="axis-footer-social">
      <a href="https://www.instagram.com/jocelainerufatto/" target="_blank" rel="noopener noreferrer">Instagram</a>
    </div>
    <p>{footerCopyright()}</p>
  </footer>;
}
