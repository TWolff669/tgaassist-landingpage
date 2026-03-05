# TGAassist Landing Page

**Live:** https://tgaassist.app  
**CMS:** https://tgaassist.app/admin  
**Stack:** Static HTML + Decap CMS + Netlify

## Workflow

1. Änderungen lokal machen oder direkt in GitHub editieren
2. Push zu `main` → Netlify deployed automatisch (ca. 10–30 Sek.)
3. Blog-Artikel schreiben: https://tgaassist.app/admin

## Struktur

```
/
├── index.html          # Landing Page
├── blog/               # Blog-Artikel (Markdown)
├── admin/              # Decap CMS
│   ├── index.html
│   └── config.yml
├── assets/
│   └── images/         # Bilder/Medien
└── netlify.toml        # Netlify Konfiguration
```
