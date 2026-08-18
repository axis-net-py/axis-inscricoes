import {footerCopyright} from '@/lib/footer.mjs';

export default function AxisFooter({logoSrc, logoAlt='Marca do evento'}) {
  return <footer className="axis-footer">
    <style>{`.axis-footer{padding:48px 20px 42px;background:#0a192f;color:#fff;text-align:center;border-top:1px solid rgba(212,175,55,.25)}.axis-footer-logo{height:52px;width:auto;margin:0 auto 20px;display:block;object-fit:contain}.axis-footer-social{display:flex;justify-content:center;gap:26px;margin-bottom:22px}.axis-footer-social a{color:rgba(255,255,255,.62);font:500 12px 'Inter',sans-serif;letter-spacing:1.2px;text-transform:uppercase;text-decoration:none;transition:.2s}.axis-footer-social a:hover{color:#d4af37}.axis-footer p{margin:0;color:rgba(255,255,255,.5);font:500 10px 'Inter',sans-serif;letter-spacing:1.35px;text-transform:uppercase}@media(min-width:821px){.axis-footer{padding:58px 24px 50px}.axis-footer-logo{height:58px}.axis-footer p{font-size:11px}}`}</style>
    {logoSrc&&<img className="axis-footer-logo" src={logoSrc} alt={logoAlt}/>} 
    <div className="axis-footer-social">
      <a href="https://www.instagram.com/jocelainerufatto/" target="_blank" rel="noopener noreferrer">Instagram</a>
    </div>
    <p>{footerCopyright()}</p>
  </footer>;
}
