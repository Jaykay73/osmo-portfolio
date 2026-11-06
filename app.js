const content = window.OSMO;
const gallery = document.querySelector('#gallery');
const dialog = document.querySelector('#lightbox');
let selected = 0;
let visiblePhotos = [];
let returnFocus;
function image(src, alt, position='center') { const el=document.createElement('img'); el.src=src;el.alt=alt;el.style.objectPosition=position;return el; }
function mountImage(selector, src, alt, position) { if(!src)return;const parent=document.querySelector(selector);parent.replaceChildren(image(src,alt,position)); }
mountImage('#portrait',content.portrait,'Osmo, photographer');
document.querySelector('#bio').textContent=content.bio;
document.querySelector('#year').textContent=new Date().getFullYear();
if(content.email){const a=document.querySelector('#contact-action');a.href='mailto:'+content.email;a.removeAttribute('target');a.innerHTML='Start a project <span aria-hidden="true">&#8599;</span>';document.querySelector('.contact-email').href='mailto:'+content.email;document.querySelector('.contact-email').textContent=content.email;}
function showPhoto(index){selected=(index+visiblePhotos.length)%visiblePhotos.length;const p=visiblePhotos[selected];document.querySelector('#full-image').src=p.src;document.querySelector('#full-image').alt=p.alt||p.title;document.querySelector('#image-caption').textContent=p.title+' — '+(selected+1)+' / '+visiblePhotos.length;}
let activeCategory = 'All';
const initialPhotoLimit = window.matchMedia('(max-width:600px)').matches ? 4 : 8;
let photoLimit = initialPhotoLimit;
function render(category='All', append=false) {
  activeCategory=category;
  if(!append) { photoLimit=initialPhotoLimit; gallery.replaceChildren(); }
  const photos=content.photos.filter(p=>category==='All'||p.category===category);
  visiblePhotos=photos.filter(p=>p.src);
  const start=append ? gallery.children.length : 0;
  photos.slice(start,photoLimit).forEach(p=>{
    const figure=document.createElement('figure');figure.className='photo';
    const box=document.createElement('button');box.className='photo-image';
    box.style.aspectRatio=p.width+' / '+p.height;
    box.setAttribute('aria-label','View '+p.title);
    const img=image(p.thumb||p.src,p.alt||p.title,p.position);
    img.width=p.width;img.height=p.height;img.loading='lazy';img.decoding='async';box.append(img);
    box.addEventListener('click',()=>{returnFocus=box;showPhoto(visiblePhotos.indexOf(p));dialog.showModal();document.body.style.overflow='hidden';});
    const caption=document.createElement('figcaption');
    const title=document.createElement('span');title.textContent=p.title;
    const cat=document.createElement('span');cat.textContent=p.category;
    caption.append(title,cat);figure.append(box,caption);gallery.append(figure);
  });
  document.querySelector('#gallery-count').textContent=Math.min(photoLimit,photos.length)+' of '+photos.length+' photographs';
  document.querySelector('#load-more').hidden=photoLimit>=photos.length;
  if(append)gallery.children[start]?.querySelector('button')?.focus({preventScroll:true});
}
document.querySelector('#load-more').addEventListener('click',()=>{photoLimit+=8;render(activeCategory,true);});
const categories=['All',...new Set(content.photos.map(p=>p.category))];categories.forEach((category,i)=>{const button=document.createElement('button');const name=document.createElement('span');name.textContent=category;const count=document.createElement('span');count.className='filter-count';count.textContent=category==='All'?content.photos.length:content.photos.filter(p=>p.category===category).length;count.setAttribute('aria-hidden','true');button.append(name,count);button.setAttribute('aria-label',category+', '+count.textContent+' photographs');button.classList.toggle('active',i===0);button.setAttribute('aria-pressed',String(i===0));button.addEventListener('click',()=>{document.querySelectorAll('.filters button').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button));});render(category);});document.querySelector('.filters').append(button);});render();
document.querySelector('#close-viewer').onclick=()=>dialog.close();dialog.addEventListener('close',()=>{document.body.style.overflow='';returnFocus?.focus();});document.querySelector('#previous-image').onclick=()=>showPhoto(selected-1);document.querySelector('#next-image').onclick=()=>showPhoto(selected+1);dialog.addEventListener('keydown',e=>{if(e.key==='ArrowRight')showPhoto(selected+1);if(e.key==='ArrowLeft')showPhoto(selected-1);});
if(content.brands.length){const list=document.querySelector('#brand-list');list.replaceChildren();content.brands.forEach(b=>{if(b.logo){list.append(image(b.logo,b.name));}else{const label=document.createElement('span');label.textContent=b.name;list.append(label);}});}
if(content.films.length){const stage=document.querySelector('#film-content');stage.replaceChildren();content.films.forEach(f=>{const figure=document.createElement('figure');const video=document.createElement('video');video.controls=true;video.preload='metadata';video.playsInline=true;video.src=f.src;if(f.poster)video.poster=f.poster;video.setAttribute('aria-label',f.title);const caption=document.createElement('figcaption');caption.textContent=f.title;figure.append(video,caption);stage.append(figure);});}
