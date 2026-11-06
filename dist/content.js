// Replace empty image paths with local assets, e.g. "assets/portrait.jpg".
// Photos keep their original proportions in the full-screen viewer.
window.OSMO = {
  name: 'Osmo',
  email: 'salakoolashubomi@gmail.com',
  hero: '',
  heroPosition: 'center',
  portrait: '',
  bio: 'For me, it starts with noticing. The light, the expression, the small detail that gives a moment its own character.',
  photos: [
    {src:'', title:'Portraits', category:'People', alt:'', position:'center'},
    {src:'', title:'A sense of place', category:'Places', alt:'', position:'center'},
    {src:'', title:'In the details', category:'Stories', alt:'', position:'center'},
    {src:'', title:'Passing moments', category:'People', alt:'', position:'center'}
  ],
  // Add actual brand credits only: {name:'Brand name', logo:'assets/brand.svg'}
  brands: [],
  // Local video files: {src:'assets/film.mp4', poster:'assets/poster.jpg', title:'Film title'}
  films: []
};
