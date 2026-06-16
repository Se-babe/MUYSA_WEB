MUYSA Connect — Image folder guide
==================================

Drop your picture files here. They are served at:
  https://muysa-6962c.web.app/images/<folder>/<filename>

Supported formats: .jpg, .jpeg, .png, .webp
Tip: Keep files under 500 KB when possible (compress at tinypng.com if needed).

FOLDERS
-------

branding/
  Logo, banner, association group photos for the home page and navbar.
  Example: branding/logo.png, branding/hero-banner.jpg

executives/
  Executive committee photos. Use clear filenames, e.g.:
  executives/president-2025.jpg
  (Photo display on executive cards can be wired after files are added.)

events/
  Static event cover images referenced manually or for seed content.
  Example: events/annual-general-meeting.jpg

news/
  Static news/announcement images (optional).
  For new posts, admins can also upload via Admin → Post News
  (requires Firebase Blaze plan for cloud upload).

members/
  General member/community photos for galleries or future features.

AFTER ADDING FILES
------------------
Run from project root:
  npm run deploy:hosting

This publishes the images to the live site.

USING IN THE APP (for developers)
---------------------------------
Reference in React/HTML as:
  /images/branding/logo.png

NOT for private user uploads — those go to Firebase Storage (see project README).

IMPORTANT — Event photo albums
--------------------------------
Do NOT put hundreds of full-resolution photos or ZIP files here.
~490 DSLR photos (~16 GB) will break Firebase Hosting deploy.

Large collections belong in:
  ../../media/events/   (local archive, safe storage)

Only put a few compressed web images here (under 300 KB each), e.g.:
  events/annual-meeting-cover.jpg
