const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// All itinerary data extracted from index.html
const days = [
  {
    dayNumber: 0,
    date: new Date('2025-01-19'),
    title: 'Travel Day',
    dayType: 'travel',
    scheduleItems: [
      { sortOrder: 0, time: '~9:40am', description: 'Depart <a href="https://www.google.com/maps/place/Newark+Liberty+International+Airport/" target="_blank">EWR</a> → HND (United UA131, 14h 40m)' }
    ],
    spots: [],
    links: [
      { sortOrder: 0, label: 'Book United', url: 'https://www.united.com' }
    ]
  },
  {
    dayNumber: 1,
    date: new Date('2025-01-20'),
    title: 'Arrival — Low-Key Landing',
    dayType: 'tokyo',
    scheduleItems: [
      { sortOrder: 0, time: '2:20pm', description: 'Land at <a href="https://www.google.com/maps/place/Haneda+Airport/" target="_blank">Haneda Terminal 3</a>' },
      { sortOrder: 1, time: '3:30pm', description: 'Clear customs, grab bags' },
      { sortOrder: 2, time: '4:30pm', description: 'Check in at <a href="https://www.google.com/maps/place/ANA+InterContinental+Tokyo/" target="_blank" class="highlight">ANA Intercontinental</a>' },
      { sortOrder: 3, time: '6:30pm', description: 'Neighborhood walk around <a href="https://www.google.com/maps/place/Akasaka,+Tokyo/" target="_blank">Akasaka</a>' },
      { sortOrder: 4, time: '7:30pm', description: '<span class="highlight">Dinner:</span> Casual izakaya or ramen', category: 'food' },
      { sortOrder: 5, time: '9:30pm', description: 'Nightcap at hotel bar' },
      { sortOrder: 6, time: '10:30pm', description: 'Crash — bank the sleep' }
    ],
    spots: [],
    links: [
      { sortOrder: 0, label: 'Route to Hotel', url: 'https://www.google.com/maps/dir/Haneda+Airport,+Tokyo,+Japan/ANA+InterContinental+Tokyo' }
    ]
  },
  {
    dayNumber: 2,
    date: new Date('2025-01-21'),
    title: 'Shimokitazawa Vintage Day',
    dayType: 'tokyo',
    scheduleItems: [
      { sortOrder: 0, time: '9:30am', description: 'Leave hotel' },
      { sortOrder: 1, time: '10:00am', description: '<a href="https://www.google.com/maps/place/Gotokuji+Temple/" target="_blank" class="highlight">Gotoku-ji Temple</a> — Lucky cat temple, hundreds of maneki-neko', category: 'cultural' },
      { sortOrder: 2, time: '11:00am', description: 'Walk to <a href="https://www.google.com/maps/place/Shimokitazawa/" target="_blank">Shimokitazawa</a>' },
      { sortOrder: 3, time: '11:30am', description: '<span class="highlight">Vintage:</span> <a href="https://www.google.com/maps/place/Flamingo+Shimokitazawa" target="_blank">Flamingo</a>, <a href="https://www.google.com/maps/place/NEW+YORK+JOE+EXCHANGE+Shimokitazawa" target="_blank">New York Joe Exchange</a>, <a href="https://www.google.com/maps/place/HAIGHT+%26+ASHBURY+shimokitazawa" target="_blank">Haight & Ashbury</a>', category: 'shopping' },
      { sortOrder: 4, time: '1:00pm', description: '<span class="highlight">Lunch:</span> Casual Shimokita spot (curry, ramen, kissaten)', category: 'food' },
      { sortOrder: 5, time: '4:30pm', description: 'Head back, rest up' },
      { sortOrder: 6, time: '7:00pm', description: '<span class="highlight">Dinner:</span> Mid-range Japanese', category: 'food' },
      { sortOrder: 7, time: '9:30pm', description: '<span class="highlight">Drinks:</span> <a href="https://www.google.com/maps/place/Bar+Piano+Shimokitazawa" target="_blank">Bar Piano</a> (jazz) or <a href="https://www.google.com/maps/place/The+SG+Club" target="_blank">SG Club</a> (Shibuya)', category: 'food' }
    ],
    spots: [
      { sortOrder: 0, name: 'Gotoku-ji Temple', description: 'Hundreds of lucky cats (maneki-neko)', category: 'cultural', mapUrl: 'https://www.google.com/maps/place/Gotokuji+Temple' },
      { sortOrder: 1, name: 'Flamingo', description: 'Best vintage in Shimokita', category: 'shopping', mapUrl: 'https://www.google.com/maps/place/Flamingo+Shimokitazawa' },
      { sortOrder: 2, name: 'New York Joe Exchange', description: 'Curated American vintage', category: 'shopping', mapUrl: 'https://www.google.com/maps/place/NEW+YORK+JOE+EXCHANGE+Shimokitazawa' },
      { sortOrder: 3, name: 'Bar Piano', description: 'Intimate jazz bar', category: 'food', mapUrl: 'https://www.google.com/maps/place/Bar+Piano+Shimokitazawa' }
    ],
    links: [
      { sortOrder: 0, label: 'Day Route', url: 'https://www.google.com/maps/dir/ANA+InterContinental+Tokyo/Gotokuji+Temple/Shimokitazawa+Station' }
    ]
  },
  {
    dayNumber: 3,
    date: new Date('2025-01-22'),
    title: 'Ginza Luxury + Michelin #1',
    dayType: 'tokyo',
    scheduleItems: [
      { sortOrder: 0, time: '10:00am', description: 'Leave hotel' },
      { sortOrder: 1, time: '10:30am', description: '<a href="https://www.google.com/maps/place/teamLab+Planets+TOKYO/" target="_blank" class="highlight">TeamLab Planets</a> — Immersive digital art (~2 hours)', category: 'cultural' },
      { sortOrder: 2, time: '1:00pm', description: 'Train to <a href="https://www.google.com/maps/place/Ginza/" target="_blank">Ginza</a>' },
      { sortOrder: 3, time: '1:30pm', description: '<span class="highlight">Lunch:</span> Department store food hall or tonkatsu', category: 'food' },
      { sortOrder: 4, time: '2:30pm', description: '<span class="highlight">Shopping:</span> <a href="https://www.google.com/maps/place/Dover+Street+Market+Ginza/" target="_blank">Dover Street Market</a>, <a href="https://www.google.com/maps/place/UNIQLO+TOKYO/" target="_blank">Uniqlo flagship</a>, <a href="https://www.google.com/maps/place/Itoya/" target="_blank">Itoya</a>', category: 'shopping' },
      { sortOrder: 5, time: '6:00pm', description: 'Back to hotel, change for dinner' },
      { sortOrder: 6, time: '7:30pm', description: '<span class="highlight">Michelin:</span> <a href="https://www.google.com/maps/place/Sushi+Kanesaka/" target="_blank">Sushi Kanesaka</a> or <a href="https://www.google.com/maps/place/Tempura+Kondo/" target="_blank">Tempura Kondo</a>', category: 'food' },
      { sortOrder: 7, time: '10:00pm', description: '<span class="highlight">Nightcap:</span> <a href="https://www.google.com/maps/place/Star+Bar+Ginza/" target="_blank">Star Bar Ginza</a> or hotel', category: 'food' }
    ],
    spots: [
      { sortOrder: 0, name: 'TeamLab Planets', description: 'Immersive digital art museum', category: 'cultural', mapUrl: 'https://www.google.com/maps/place/teamLab+Planets+TOKYO' },
      { sortOrder: 1, name: 'Dover Street Market', description: 'Comme des Garçons concept store', category: 'shopping', mapUrl: 'https://www.google.com/maps/place/Dover+Street+Market+Ginza' },
      { sortOrder: 2, name: 'Itoya', description: '12-floor stationery paradise', category: 'shopping', mapUrl: 'https://www.google.com/maps/place/Itoya+Ginza' },
      { sortOrder: 3, name: 'Star Bar Ginza', description: 'Legendary cocktail bar', category: 'food', mapUrl: 'https://www.google.com/maps/place/Star+Bar+Ginza' }
    ],
    links: [
      { sortOrder: 0, label: 'TeamLab Tickets', url: 'https://www.teamlab.art/e/planets/' },
      { sortOrder: 1, label: 'Day Route', url: 'https://www.google.com/maps/dir/ANA+InterContinental+Tokyo/teamLab+Planets+TOKYO/Ginza+Station' }
    ]
  },
  {
    dayNumber: 4,
    date: new Date('2025-01-23'),
    title: 'Koenji Deep Cuts + Shinjuku Night',
    dayType: 'tokyo',
    scheduleItems: [
      { sortOrder: 0, time: '9:30am', description: 'Leave hotel' },
      { sortOrder: 1, time: '10:00am', description: '<a href="https://www.google.com/maps/place/Meiji+Jingu/" target="_blank" class="highlight">Meiji Jingu Shrine</a> — Peaceful forest walk, iconic (45 min - 1 hour)', category: 'cultural' },
      { sortOrder: 2, time: '11:00am', description: '<span class="highlight">Harajuku:</span> <a href="https://www.google.com/maps/place/Takeshita+Street" target="_blank">Takeshita Street</a>, <a href="https://www.google.com/maps/place/Laforet+Harajuku" target="_blank">Laforet</a>, <a href="https://www.google.com/maps/place/Cat+Street,+Shibuya" target="_blank">Cat Street</a>', category: 'shopping' },
      { sortOrder: 3, time: '1:00pm', description: '<span class="highlight">Lunch:</span> Harajuku area', category: 'food' },
      { sortOrder: 4, time: '2:00pm', description: '<span class="highlight">Omotesando:</span> <a href="https://www.google.com/maps/place/Omotesando+Hills" target="_blank">Omotesando Hills</a>, <a href="https://www.google.com/maps/place/GYRE" target="_blank">GYRE</a>, flagship boutiques', category: 'shopping' },
      { sortOrder: 5, time: '4:00pm', description: '<span class="highlight"><a href="https://www.google.com/maps/place/Koenji" target="_blank">Koenji</a> vintage:</span> Slat (Levi\'s 501s), Whistler, side streets', category: 'shopping' },
      { sortOrder: 6, time: '7:00pm', description: '<span class="highlight">Dinner:</span> <a href="https://www.google.com/maps/place/Omoide+Yokocho/" target="_blank">Omoide Yokocho</a> — yakitori, tiny stalls, smoky vibes', category: 'food' },
      { sortOrder: 7, time: '9:00pm', description: '<span class="highlight"><a href="https://www.google.com/maps/place/Shinjuku+Golden+Gai" target="_blank">Golden Gai</a></span> — Bar hop (Albatross, The Open Book)', category: 'food' },
      { sortOrder: 8, time: '10:30pm', description: '<a href="https://www.google.com/maps/place/DUG/" target="_blank" class="highlight">Dug Jazz Cafe</a> — Legendary jazz bar', category: 'food' }
    ],
    spots: [
      { sortOrder: 0, name: 'Meiji Jingu', description: 'Peaceful shrine in a forest', category: 'cultural', mapUrl: 'https://www.google.com/maps/place/Meiji+Jingu' },
      { sortOrder: 1, name: 'Omotesando Hills', description: 'Ando-designed luxury mall', category: 'shopping', mapUrl: 'https://www.google.com/maps/place/Omotesando+Hills' },
      { sortOrder: 2, name: 'Laforet Harajuku', description: 'Japanese street fashion hub', category: 'shopping', mapUrl: 'https://www.google.com/maps/place/Laforet+Harajuku' },
      { sortOrder: 3, name: 'Golden Gai', description: '200+ tiny bars in alleyways', category: 'food', mapUrl: 'https://www.google.com/maps/place/Golden+Gai' }
    ],
    links: [
      { sortOrder: 0, label: 'Day Route', url: 'https://www.google.com/maps/dir/ANA+InterContinental+Tokyo/Meiji+Jingu/Harajuku+Station/Koenji+Station/Shinjuku+Station' }
    ]
  },
  {
    dayNumber: 5,
    date: new Date('2025-01-24'),
    title: 'Travel to Niseko + Night Skiing',
    dayType: 'travel',
    scheduleItems: [
      { sortOrder: 0, time: '7:30am', description: 'Wake up' },
      { sortOrder: 1, time: '8:30am', description: 'Leave hotel for <a href="https://www.google.com/maps/place/Haneda+Airport+Terminal+1/" target="_blank">Haneda</a>' },
      { sortOrder: 2, time: '10:00am', description: 'Flight HND → CTS (1.5 hours)' },
      { sortOrder: 3, time: '11:30am', description: 'Land at <a href="https://www.google.com/maps/place/New+Chitose+Airport/" target="_blank">New Chitose Airport</a>' },
      { sortOrder: 4, time: '12:15pm', description: '<a href="https://www.google.com/maps/place/New+Chitose+Airport+Bus+Terminal/" target="_blank" class="highlight">White Liner bus</a> to Niseko (~2.5-3 hours)' },
      { sortOrder: 5, time: '3:00pm', description: 'Arrive <a href="https://www.google.com/maps/place/Hirafu/" target="_blank">Hirafu</a>, check in at <a href="https://www.google.com/maps/place/Aya+Niseko/" target="_blank" class="highlight">Aya Niseko</a>' },
      { sortOrder: 6, time: '3:30pm', description: 'Grab gear at <a href="https://www.google.com/maps/place/Rhythm+Niseko+Hirafu/" target="_blank">Rhythm Japan</a>' },
      { sortOrder: 7, time: '4-7pm', description: '<span class="highlight">Night skiing!</span> <a href="https://www.google.com/maps/place/Niseko+Grand+Hirafu/" target="_blank">Grand Hirafu</a> — heated gondola, 10km lit terrain' },
      { sortOrder: 8, time: '8:00pm', description: '<span class="highlight">Dinner + Après:</span> Aya restaurant or Hirafu village', category: 'food' }
    ],
    spots: [],
    links: [
      { sortOrder: 0, label: 'White Liner Bus', url: 'https://goodsports.co.jp/white_eng/ski-bus/' },
      { sortOrder: 1, label: 'Rhythm Rentals', url: 'https://rhythmjapan.com/' },
      { sortOrder: 2, label: 'Night Ski Info', url: 'https://www.grand-hirafu.jp/en/activities/night-skiing/' }
    ]
  },
  {
    dayNumber: 6,
    date: new Date('2025-01-25'),
    title: 'Ski Day 1',
    dayType: 'niseko',
    scheduleItems: [
      { sortOrder: 0, time: '8:30am', description: 'Lifts open — first chair at <a href="https://www.google.com/maps/place/Niseko+Grand+Hirafu/" target="_blank">Grand Hirafu</a>' },
      { sortOrder: 1, time: 'All day', description: 'Ride the gates, hunt the powder' },
      { sortOrder: 2, time: '4:00pm', description: 'Day lifts close (night skiing 4-7pm optional)' },
      { sortOrder: 3, time: 'Options', description: '<a href="https://www.google.com/maps/place/Rakuichi+Soba/" target="_blank" class="highlight">Rakuichi Soba</a> (handmade), <a href="https://www.google.com/maps/search/An+Dining+Niseko/" target="_blank" class="highlight">An Dining</a> (upscale fusion), <a href="https://www.google.com/maps/search/Niseko+Pizza/" target="_blank">Niseko Pizza</a> (casual)', category: 'food' }
    ],
    spots: [
      { sortOrder: 0, name: 'Bar Gyu+ (Fridge Door)', description: 'Hidden speakeasy, whiskey, intimate', category: 'chill', mapUrl: 'https://www.google.com/maps/search/Bar+Gyu+Niseko+Hirafu/' },
      { sortOrder: 1, name: "Toshiro's Bar", description: 'Award-winning cocktails, high-end (at Sansui Niseko)', category: 'chill', mapUrl: 'https://www.google.com/maps/place/Sansui+Niseko/' },
      { sortOrder: 2, name: 'Tamashii Bar', description: 'Main street, good food, DJs (across from Seicomart)', category: 'party', mapUrl: 'https://www.google.com/maps/search/Tamashii+Bar+Niseko/' },
      { sortOrder: 3, name: 'Half Note Bar', description: 'Live music, sports screens', category: 'party', mapUrl: 'https://www.google.com/maps/search/Half+Note+Bar+Niseko/' }
    ],
    links: [
      { sortOrder: 0, label: 'Avalanche Conditions', url: 'https://niseko.nadare.info/' }
    ]
  },
  {
    dayNumber: 7,
    date: new Date('2025-01-26'),
    title: 'Ski Day 2',
    dayType: 'niseko',
    scheduleItems: [],
    spots: [
      { sortOrder: 0, name: 'Musu Bar + Bistro', description: 'Fireplace, craft cocktails, upscale (2F Odin Place)', category: 'chill', mapUrl: 'https://www.google.com/maps/search/Musu+Bar+Niseko/' },
      { sortOrder: 1, name: 'Niseko Confidential', description: 'New Tokyo Confidential outpost, creative cocktails', category: 'chill', mapUrl: 'https://www.google.com/maps/search/Niseko+Confidential/' },
      { sortOrder: 2, name: 'Tamashii Bar', description: 'Weekend DJs, games, pool table', category: 'party', mapUrl: 'https://www.google.com/maps/search/Tamashii+Bar+Niseko/' },
      { sortOrder: 3, name: 'Powder Room', description: 'Actual nightclub, dance floor + champagne', category: 'party', mapUrl: 'https://www.google.com/maps/search/Powder+Room+Niseko/' }
    ],
    links: []
  },
  {
    dayNumber: 8,
    date: new Date('2025-01-27'),
    title: 'Ski Day 3',
    dayType: 'niseko',
    scheduleItems: [
      { sortOrder: 0, time: 'Evening', description: '<span class="highlight">Aya Niseko onsen</span> — Perfect after a hard day in the gates' }
    ],
    spots: [
      { sortOrder: 0, name: 'Bar Gyu+', description: 'Worth a second visit', category: 'chill', mapUrl: 'https://www.google.com/maps/search/Bar+Gyu+Niseko+Hirafu/' },
      { sortOrder: 1, name: "Toshiro's Bar", description: 'Try different whiskeys this time', category: 'chill', mapUrl: 'https://www.google.com/maps/place/Sansui+Niseko/' },
      { sortOrder: 2, name: 'Half Note Bar', description: 'Weeknight might be mellower', category: 'party', mapUrl: 'https://www.google.com/maps/search/Half+Note+Bar+Niseko/' }
    ],
    links: []
  },
  {
    dayNumber: 9,
    date: new Date('2025-01-28'),
    title: 'Ski Day 4 — Last Day on Snow',
    dayType: 'niseko',
    scheduleItems: [
      { sortOrder: 0, time: 'All day', description: 'Hit the gates early if conditions are good. Leave it all out there.' },
      { sortOrder: 1, time: 'Tonight', description: 'Pack up — early-ish start tomorrow for Tokyo' }
    ],
    spots: [
      { sortOrder: 0, name: 'Niseko Confidential', description: 'End on a high-end note', category: 'chill', mapUrl: 'https://www.google.com/maps/search/Niseko+Confidential/' },
      { sortOrder: 1, name: 'Tamashii → Powder Room', description: 'Last night sendoff', category: 'party', mapUrl: 'https://www.google.com/maps/search/Tamashii+Bar+Niseko/' }
    ],
    links: []
  },
  {
    dayNumber: 10,
    date: new Date('2025-01-29'),
    title: 'Return to Tokyo — Splurge Check-In',
    dayType: 'travel',
    scheduleItems: [
      { sortOrder: 0, time: '7:00am', description: 'Wake up, pack' },
      { sortOrder: 1, time: '8:00am', description: '<a href="https://www.google.com/maps/search/Hirafu+Welcome+Center/" target="_blank">White Liner bus</a> to CTS (~2.5-3 hours)' },
      { sortOrder: 2, time: '11:00am', description: 'Arrive <a href="https://www.google.com/maps/place/New+Chitose+Airport/" target="_blank">New Chitose</a>' },
      { sortOrder: 3, time: '12:00pm', description: 'Flight CTS → HND' },
      { sortOrder: 4, time: '1:30pm', description: 'Arrive <a href="https://www.google.com/maps/place/Haneda+Airport/" target="_blank">Haneda</a>' },
      { sortOrder: 5, time: '2:30pm', description: 'Check in at <span class="highlight">Splurge Hotel</span>' },
      { sortOrder: 6, time: '3:30pm', description: 'Settle in, enjoy the hotel' },
      { sortOrder: 7, time: '4:30pm', description: 'Onsen / spa / pool time' },
      { sortOrder: 8, time: '7:00pm', description: '<span class="highlight">Dinner:</span> Keep it casual — hotel restaurant or nearby', category: 'food' },
      { sortOrder: 9, time: '9:30pm', description: 'Hotel bar or early night' }
    ],
    spots: [],
    links: [
      { sortOrder: 0, label: 'Aman Tokyo', url: 'https://www.google.com/maps/place/Aman+Tokyo/' },
      { sortOrder: 1, label: 'Hoshinoya Tokyo', url: 'https://www.google.com/maps/place/HOSHINOYA+Tokyo/' },
      { sortOrder: 2, label: 'Four Seasons', url: 'https://www.google.com/maps/place/Four+Seasons+Hotel+Tokyo+at+Otemachi/' }
    ]
  },
  {
    dayNumber: 11,
    date: new Date('2025-01-30'),
    title: 'Nakameguro + Daikanyama',
    dayType: 'tokyo',
    scheduleItems: [
      { sortOrder: 0, time: '10:00am', description: 'Leave hotel' },
      { sortOrder: 1, time: '10:30am', description: '<a href="https://www.google.com/maps/place/Nezu+Shrine/" target="_blank" class="highlight">Nezu Shrine</a> — Red torii gates, less touristy (45 min)', category: 'cultural' },
      { sortOrder: 2, time: '12:00pm', description: '<span class="highlight">Lunch:</span> <a href="https://www.google.com/maps/place/Nakameguro/" target="_blank">Nakameguro</a> canal-side cafe', category: 'food' },
      { sortOrder: 3, time: '1:00pm', description: '<span class="highlight">Browse:</span> <a href="https://www.google.com/maps/place/COW+BOOKS/" target="_blank">Cow Books</a>, <a href="https://www.google.com/maps/place/Okura/" target="_blank">Okura</a> (indigo), <a href="https://www.google.com/maps/place/Daikanyama+T-Site/" target="_blank">T-Site Tsutaya</a>', category: 'shopping' },
      { sortOrder: 4, time: '4:30pm', description: 'Head back to hotel' },
      { sortOrder: 5, time: '7:00pm', description: '<span class="highlight">Dinner:</span> Casual neighborhood spot', category: 'food' },
      { sortOrder: 6, time: '9:00pm', description: '<a href="https://www.google.com/maps/place/Nonbei+Yokocho/" target="_blank" class="highlight">Nonbei Yokocho</a> — Old-school tiny bar alley (Shibuya)', category: 'food' },
      { sortOrder: 7, time: '10:30pm', description: '<a href="https://www.google.com/maps/place/The+SG+Club/" target="_blank" class="highlight">SG Club</a> if you missed it earlier', category: 'food' }
    ],
    spots: [
      { sortOrder: 0, name: 'Nezu Shrine', description: 'Beautiful torii gates, quiet', category: 'cultural', mapUrl: 'https://www.google.com/maps/place/Nezu+Shrine' },
      { sortOrder: 1, name: 'Daikanyama T-Site', description: 'Beautiful bookstore complex', category: 'shopping', mapUrl: 'https://www.google.com/maps/place/Daikanyama+T-Site' },
      { sortOrder: 2, name: 'Okura', description: 'Indigo-dyed goods', category: 'shopping', mapUrl: 'https://www.google.com/maps/place/Okura+Nakameguro' },
      { sortOrder: 3, name: 'SG Club', description: 'World-class cocktails', category: 'food', mapUrl: 'https://www.google.com/maps/place/The+SG+Club' }
    ],
    links: [
      { sortOrder: 0, label: 'Day Route', url: 'https://www.google.com/maps/dir/Nezu+Shrine/Nakameguro+Station/Daikanyama+Station' }
    ]
  },
  {
    dayNumber: 12,
    date: new Date('2025-01-31'),
    title: 'Asakusa + Ueno + Michelin #2',
    dayType: 'tokyo',
    scheduleItems: [
      { sortOrder: 0, time: '9:30am', description: 'Leave hotel' },
      { sortOrder: 1, time: '10:00am', description: '<a href="https://www.google.com/maps/place/Senso-ji+Temple/" target="_blank" class="highlight">Senso-ji Temple</a> — Classic, iconic + <a href="https://www.google.com/maps/place/Nakamise-dori+Street/" target="_blank">Nakamise-dori</a> shopping', category: 'cultural' },
      { sortOrder: 2, time: '11:30am', description: '<a href="https://www.google.com/maps/place/Kappabashi+Dogugai+Street" target="_blank">Kappabashi</a> — Kitchen street (optional)', category: 'shopping' },
      { sortOrder: 3, time: '12:30pm', description: '<span class="highlight">Lunch:</span> <a href="https://www.google.com/maps/place/Asakusa" target="_blank">Asakusa</a> (tempura, soba, unagi)', category: 'food' },
      { sortOrder: 4, time: '2:00pm', description: '<span class="highlight">Ueno:</span> <a href="https://www.google.com/maps/place/Ameyoko+Shopping+Street" target="_blank">Ameyoko</a> market street, street food, vintage finds', category: 'shopping' },
      { sortOrder: 5, time: '3:30pm', description: '<a href="https://www.google.com/maps/place/Yanaka+Ginza+Shopping+Street" target="_blank" class="highlight">Yanaka Ginza</a> — "Old Tokyo" retro streets', category: 'cultural' },
      { sortOrder: 6, time: '5:00pm', description: 'Back to hotel, rest + change' },
      { sortOrder: 7, time: '7:30pm', description: '<span class="highlight">Michelin #2:</span> <a href="https://www.google.com/maps/place/Nihonryori+RyuGin/" target="_blank">RyuGin</a> or <a href="https://www.google.com/maps/place/Den/" target="_blank">Den</a> (kaiseki)', category: 'food' },
      { sortOrder: 8, time: '10:30pm', description: '<span class="highlight">Final drinks:</span> <a href="https://www.google.com/maps/place/DUG/" target="_blank">Dug Jazz</a> or hotel bar', category: 'food' }
    ],
    spots: [
      { sortOrder: 0, name: 'Senso-ji Temple', description: "Tokyo's oldest temple", category: 'cultural', mapUrl: 'https://www.google.com/maps/place/Senso-ji+Temple' },
      { sortOrder: 1, name: 'Ameyoko', description: 'Bustling market street', category: 'shopping', mapUrl: 'https://www.google.com/maps/place/Ameyoko+Shopping+Street' },
      { sortOrder: 2, name: 'Kappabashi', description: 'Kitchen supply street', category: 'shopping', mapUrl: 'https://www.google.com/maps/place/Kappabashi+Dogugai+Street' },
      { sortOrder: 3, name: 'Yanaka Ginza', description: 'Retro old-Tokyo vibe', category: 'cultural', mapUrl: 'https://www.google.com/maps/place/Yanaka+Ginza+Shopping+Street' }
    ],
    links: [
      { sortOrder: 0, label: 'Day Route', url: 'https://www.google.com/maps/dir/Senso-ji+Temple/Kappabashi+Dogugai+Street/Ameyoko+Shopping+Street/Yanaka+Ginza+Shopping+Street' }
    ]
  },
  {
    dayNumber: 13,
    date: new Date('2025-02-01'),
    title: 'Final Morning + Fly Home',
    dayType: 'travel',
    scheduleItems: [
      { sortOrder: 0, time: '9:00am', description: 'Sleep in, slow morning' },
      { sortOrder: 1, time: '10:00am', description: 'Hotel breakfast — splurge on it' },
      { sortOrder: 2, time: '11:00am', description: 'Last-minute shopping, konbini snack haul' },
      { sortOrder: 3, time: '1:00pm', description: '<span class="highlight">Lunch:</span> Keep it light', category: 'food' },
      { sortOrder: 4, time: '2:30pm', description: 'Check out, taxi to <a href="https://www.google.com/maps/place/Haneda+Airport/" target="_blank">Haneda</a> (~40 min)' },
      { sortOrder: 5, time: '3:30pm', description: 'Arrive Haneda Terminal 3' },
      { sortOrder: 6, time: '6:25pm', description: '<span class="highlight">Fly home</span> — HND → EWR' }
    ],
    spots: [],
    links: []
  }
];

async function migrate() {
  console.log('Starting migration...\n');

  // Clear existing itinerary data (keep comments and requests)
  console.log('Clearing existing itinerary data...');
  await prisma.dayLink.deleteMany();
  await prisma.spot.deleteMany();
  await prisma.scheduleItem.deleteMany();
  await prisma.day.deleteMany();
  console.log('Cleared.\n');

  // Insert days with relations
  for (const dayData of days) {
    const { scheduleItems, spots, links, ...dayFields } = dayData;

    const day = await prisma.day.create({
      data: {
        ...dayFields,
        scheduleItems: { create: scheduleItems },
        spots: { create: spots },
        links: { create: links }
      }
    });
    console.log(`✓ Day ${day.dayNumber}: ${day.title}`);
  }

  console.log('\n✅ Migration complete!');
  console.log(`   Inserted ${days.length} days with schedule items, spots, and links.`);
}

migrate()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
