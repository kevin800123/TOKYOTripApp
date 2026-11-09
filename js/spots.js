// 景點照片與介紹。照片都來自 Wikimedia Commons，授權允許再利用，署名顯示在詳情頁。
// sample: true 表示照片是同類型的示意，不是行程上那一家店或那一艘船。
const SPOTS = {
    narita_t2: {
        name: '成田機場第 2 航廈', photo: 'photos/narita_t2.webp',
        intro: '台灣虎航抵達的航廈。航廈地下就有 JR 和京成的車站，出關後跟著鐵道指標走，就能搭 Skyliner 進東京。',
        credit: { author: 'Banbam1029', license: 'CC BY-SA 4.0', url: 'https://commons.wikimedia.org/wiki/File:Narita_Airport_Terminal_2_exterior.jpg' },
    },
    narita_t1: {
        name: '成田機場第 1 航廈', photo: 'photos/narita_t1.webp',
        intro: '航廈分成南北兩翼，樂桃在北翼。地下的成田機場站是 Skyliner 的終點，下車後搭電扶梯上樓就到出境大廳。',
        credit: { author: '名無し野電車区', license: 'CC BY-SA 3.0', url: 'https://commons.wikimedia.org/wiki/File:Narita_International_Airport_Terminal_1.JPG' },
    },
    ueno: {
        name: '上野站', photo: 'photos/ueno.webp',
        intro: '這趟的住宿據點。新幹線、JR 和地鐵都在這裡，京成上野站走路幾分鐘，到成田機場和越後湯澤都不用轉車。飯店還沒訂，先放車站的照片。',
        credit: { author: 'MaedaAkihiko', license: 'CC BY-SA 4.0', url: 'https://commons.wikimedia.org/wiki/File:JRE-Ueno-STA.jpg' },
    },
    ramen: {
        name: '拉麵', photo: 'photos/ramen.webp', sample: true,
        intro: '上野車站周邊拉麵店很密集，不少開到深夜。多數店家在門口的食券機點餐，先買票再入座。',
        credit: { author: 'Ominae', license: 'CC BY-SA 4.0', url: 'https://commons.wikimedia.org/wiki/File:Hakata_ramen_bowl_closeup.jpg' },
    },
    waraji: {
        name: '草鞋豬排丼', photo: 'photos/waraji.webp', sample: true,
        intro: '秩父的代表料理。薄切豬排炸過後沾上甜鹹的醬汁，鋪滿整碗白飯，大小和形狀像一雙草鞋（わらじ），因此得名。',
        credit: { author: 'Ocdp', license: 'CC BY-SA 3.0', url: 'https://commons.wikimedia.org/wiki/File:Warajikatsu.jpg' },
    },
    chichibu_shrine: {
        name: '秩父神社', photo: 'photos/chichibu_shrine.webp',
        intro: '秩父地方的總鎮守，現在的社殿是 1592 年由德川家康捐建。社殿四周布滿色彩鮮豔的雕刻，其中活潑的「三猿」和轉過頭的貓頭鷹最受歡迎。每年 12 月的秩父夜祭，是日本三大曳山祭之一。',
        credit: { author: 'NY066', license: 'CC BY-SA 3.0', url: 'https://commons.wikimedia.org/wiki/File:Chichibu-Shrine.JPG' },
    },
    matsurinoyu: {
        name: '西武秩父站前溫泉祭の湯', photo: 'photos/matsurinoyu.webp',
        intro: '和西武秩父站相連的溫泉設施，以秩父夜祭為裝潢主題。一邊是要買票的溫泉，一邊是不用門票的美食街和伴手禮區。',
        credit: { author: 'Asturio Cantabrio', license: 'CC BY-SA 4.0', url: 'https://commons.wikimedia.org/wiki/File:Seibu-Chichibu_Ekimae_Onsen_ac_(1).jpg' },
    },
    ashigakubo: {
        name: 'あしがくぼの氷柱', photo: 'photos/ashigakubo.webp',
        intro: '每年冬天，當地人在山坡上噴水，讓水一層一層結凍成整片人造冰柱。入夜後打上彩色燈光，西武線的電車就從冰柱旁邊開過。',
        credit: { author: 'Lovetodai', license: 'CC BY-SA 4.0', url: 'https://commons.wikimedia.org/wiki/File:%E3%81%82%E3%81%97%E3%81%8C%E3%81%8F%E3%81%BC%E3%81%AE%E6%B0%B7%E6%9F%B1profile.jpg' },
    },
    gala: {
        name: 'GALA 湯澤雪場中心', photo: 'photos/gala.webp',
        intro: '雪季限定的 GALA 湯澤站直接連著雪場中心，走出驗票口就能換票、租雪具、寄物和吃飯，是少數新幹線可以直達的滑雪場。',
        credit: { author: 'Roodee', license: 'CC BY 2.0', url: 'https://commons.wikimedia.org/wiki/File:Gala_Yuzawa_03.jpg' },
    },
    gala_slope: {
        name: 'GALA 湯澤雪道', photo: 'photos/gala_slope.webp',
        intro: '雪道在山上，要從雪場中心搭纜車上去，新手課和緩坡都在上面。天氣好時可以看到越後一帶連綿的雪山。',
        credit: { author: 'Syced', license: 'CC0', url: 'https://commons.wikimedia.org/wiki/File:Gala-Yuzawa_(94209).jpg' },
    },
    yuzawa: {
        name: '越後湯澤溫泉', photo: 'photos/yuzawa.webp',
        intro: '川端康成小說《雪國》的舞台，車站周邊溫泉旅館很多。這一帶是日本有名的豪雪地帶，冬天路旁常堆著高高的雪牆。',
        credit: { author: 'Abasaa', license: 'Public domain', url: 'https://commons.wikimedia.org/wiki/File:Entrance_to_Echigo-Yuzawa_Onsen.JPG' },
    },
    ponshukan: {
        name: 'ぽんしゅ館', photo: 'photos/ponshukan.webp',
        intro: '越後湯澤站內的日本酒主題館。整面牆都是投幣試飲機，換代幣就能試喝新潟各酒廠的酒。同一區也買得到魚沼米飯糰和在地小吃。',
        credit: { author: 'SLIMHANNYA', license: 'CC BY-SA 4.0', url: 'https://commons.wikimedia.org/wiki/File:Ponshu-kan,_Echigo-Yuzawa,_Niigata,_%E8%B6%8A%E5%BE%8C%E6%B9%AF%E6%B2%A2%E9%A7%85%E3%81%AE%E3%81%BD%E3%82%93%E3%81%97%E3%82%85%E9%A4%A8.jpg' },
    },
    soup_curry: {
        name: '湯咖哩', photo: 'photos/soup_curry.webp', sample: true,
        intro: '源自北海道札幌的咖哩，湯汁清爽、香料味重，配上大塊蔬菜和雞腿，白飯另外裝。下北澤咖哩店很多，還有自己的咖哩節。',
        credit: { author: 'Otkoyg', license: 'CC BY-SA 4.0', url: 'https://commons.wikimedia.org/wiki/File:%E3%82%B9%E3%83%BC%E3%83%97%E3%82%AB%E3%83%AC%E3%83%BC_Soup_Curry.jpg' },
    },
    shimokita: {
        name: '下北澤', photo: 'photos/shimokita.webp',
        intro: '東京的古著重鎮，也是小劇場和 live house 聚集的地方。小田急線地下化之後，舊鐵道上方多了 BONUS TRACK 這樣的小店聚落，很適合慢慢逛。',
        credit: { author: 'Syced', license: 'CC0', url: 'https://commons.wikimedia.org/wiki/File:Walk_in_Shimokitazawa_6.jpg' },
    },
    daikanyama: {
        name: '代官山 T-SITE', photo: 'photos/daikanyama.webp',
        intro: '蔦屋書店由三棟相連的建築組成，書、音樂、電影和咖啡都在同一個空間。周邊是安靜的住宅區和小店，適合散步。',
        credit: { author: 'Jonathan Lin', license: 'CC BY-SA 2.0', url: 'https://commons.wikimedia.org/wiki/File:Daikanyama_T-SITE_2016-04-04.jpg' },
    },
    yakatabune: {
        name: '屋形船', photo: 'photos/yakatabune.webp', sample: true,
        intro: '江戶時代就有的傳統遊船，船艙裡有和式座位，一邊吃料理一邊看沿岸夜景。實際航線依船家安排，東京灣常見的路線會經過彩虹大橋和台場。',
        credit: { author: 'Nesnad', license: 'CC BY 3.0', url: 'https://commons.wikimedia.org/wiki/File:Yakatabune-nearodaiba-jan27-2015.jpg' },
    },
    hakushu: {
        name: '白州蒸溜所', photo: 'photos/hakushu.webp',
        intro: '三得利 1973 年在山梨縣甲斐駒ヶ岳山麓建立的蒸溜所，四周是大片森林，被稱為「森林蒸溜所」。導覽會走過糖化、發酵、蒸餾的現場，最後試飲。',
        credit: { author: 'tetsuya yamamoto', license: 'CC0', url: 'https://commons.wikimedia.org/wiki/File:Hakushu_Distillery_-_32128449586.jpg' },
    },
    hakushu_museum: {
        name: '白州蒸溜所園區', photo: 'photos/hakushu_museum.webp',
        intro: '園區裡的威士忌博物館，外型取自傳統燻麥塔的尖屋頂。園區也有餐廳和商店，部分商品只在這裡賣，實際開放內容以官網為準。',
        credit: { author: 'Keeezawa', license: 'CC BY-SA 4.0', url: 'https://commons.wikimedia.org/wiki/File:Hakushu_distillery_museum.jpg' },
    },
    kagurazaka: {
        name: '神樂坂', photo: 'photos/kagurazaka.webp',
        intro: '過去是東京的花街，大路旁的窄巷裡還留著石板路和料亭。かくれんぼ橫丁的意思是「捉迷藏巷」，巷子窄到人一轉彎就不見了。',
        credit: { author: 'Yasuhiro from Tokyo, Japan', license: 'CC BY 2.0', url: 'https://commons.wikimedia.org/wiki/File:Kagurazaka_Tokyo_Japan.jpg' },
    },
    whisky: {
        name: '日本威士忌', photo: 'photos/whisky.webp', sample: true,
        intro: 'Mizunara 是日本橡木「水楢」的名字，用它做的酒桶會帶來像沉香的氣味，是日本威士忌的招牌特色。酒單很長時，可以請店員依喜好推薦。',
        credit: { author: 'cegoh', license: 'CC0', url: 'https://commons.wikimedia.org/wiki/File:Bar_Yamazaki.jpg' },
    },
    sumo: {
        name: '相撲部屋晨練', photo: 'photos/sumo.webp', sample: true,
        intro: '力士每天清晨在部屋的土俵上練習，稱為「朝稽古」。兩國有國技館，周邊也有許多相撲部屋，被稱為相撲之町。能不能拍照依部屋和導覽的規定。',
        credit: { author: 'amanderson2', license: 'CC BY 2.0', url: 'https://commons.wikimedia.org/wiki/File:Practice_at_Arashio_Stable_2014-08-05.jpg' },
    },
    ameyoko: {
        name: '阿美橫町', photo: 'photos/ameyoko.webp',
        intro: '從上野到御徒町、沿著高架鐵道約 500 公尺的市集，起源於戰後的黑市。乾貨、藥妝、零食、服飾都有，假日人最多。',
        credit: { author: 'AugustGresh', license: 'CC BY-SA 4.0', url: 'https://commons.wikimedia.org/wiki/File:Ameya-Yokoch%C5%8D_Entrance.jpg' },
    },
    yakiniku: {
        name: '日式燒肉', photo: 'photos/yakiniku.webp', sample: true,
        intro: '單點牛肉的各個部位，自己在桌上烤。上野站東側的東上野有一小區韓國街，燒肉店特別集中，走路就能到。',
        credit: { author: 'Syced', license: 'CC0', url: 'https://commons.wikimedia.org/wiki/File:Steak_at_yakiniku_restaurant_just_outside_Moon_Beach.jpg' },
    },
};
