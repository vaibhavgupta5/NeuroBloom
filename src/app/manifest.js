export default function manifest() {
  return {
    name: 'NeuroBloom',
    short_name: 'NeuroBloom',
    description: "Science-backed, game-based therapy for children on the autism spectrum.",
    start_url: '/',
    display: 'standalone',
    background_color: '#E8FAF6',
    theme_color: '#E8FAF6',
    icons: [
      {
        src: '/window.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  }
}
