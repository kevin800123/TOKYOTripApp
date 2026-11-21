// 景點照片與介紹。照片都來自 Wikimedia Commons，授權允許再利用，署名顯示在詳情頁。
// sample: true 表示照片是同類型的示意，不是行程上實際去的那一家店。
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
        intro: '池袋是東京有名的拉麵激戰區，車站東口一帶店家很密集，不少開到深夜。多數店家在門口的食券機點餐，先買票再入座。',
        credit: { author: 'Ominae', license: 'CC BY-SA 4.0', url: 'https://commons.wikimedia.org/wiki/File:Hakata_ramen_bowl_closeup.jpg' },
    },
    iwappara: {
        name: '岩原滑雪場', photo: 'photos/iwappara.webp',
        intro: '越後湯澤站搭免費接駁車約 10 分鐘。中腹有一大片又寬又緩的初學者坡，最緩的地方只有 6 度，視野開闊沒有障礙物，很適合第一次滑雪。照片是 2004 年 2 月拍的。',
        credit: { author: 'Famifamifami', license: 'Public domain', url: 'https://commons.wikimedia.org/wiki/File:Iwappara.jpg' },
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
    yanaka: {
        name: '谷中銀座', photo: 'photos/yanaka.webp',
        intro: '二戰時沒有被大規模燒毀的下町，寺廟、木造老屋和小巷都還在。夕やけだんだん是一段看夕陽有名的階梯，走下去就是約 60 家小店的谷中銀座商店街。',
        credit: { author: 'Stephen Kelly from San Francisco, CA, USA', license: 'CC BY 2.0', url: 'https://commons.wikimedia.org/wiki/File:Yanaka_Ginza,_Yanaka_(53417016334).jpg' },
    },
    nezu: {
        name: '根津神社', photo: 'photos/nezu.webp',
        intro: '傳說由日本武尊創建，現在的社殿建於 1706 年，包含社殿在內有多處國家重要文化財。境內一排紅色小鳥居很好拍，門票免費。',
        credit: { author: 'Wiiii', license: 'CC BY-SA 3.0', url: 'https://commons.wikimedia.org/wiki/File:Nezu_Shrine_2010.jpg' },
    },
    yushima: {
        name: '湯島天神', photo: 'photos/yushima.webp',
        intro: '祭祀學問之神菅原道真，考季時擠滿考生和繪馬。境內約有 300 棵梅樹，以白梅為主，每年 2 月到 3 月初舉辦梅祭，晚上有點燈。',
        credit: { author: 'Manish Prabhune', license: 'CC BY 4.0', url: 'https://commons.wikimedia.org/wiki/File:Yushima_Tenjin_Shrine,_Tokyo.jpg' },
    },
    sento: {
        name: '東京的錢湯', photo: 'photos/sento.webp', sample: true,
        intro: '東京的公共澡堂，費用便宜，是當地人的日常。行程上的萩の湯離鶯谷站很近，是都內數一數二大的錢湯，有露天浴池和餐廳。進浴池前要先洗淨身體，不能把毛巾放進水裡。',
        credit: { author: 'Kurihaya', license: 'CC0', url: 'https://commons.wikimedia.org/wiki/File:Tatsuno-yu_Sento_Tokyo_2.jpg' },
    },
    musashino: {
        name: '三得利武藏野啤酒廠', photo: 'photos/musashino.webp',
        intro: '三得利位於東京府中的啤酒廠，The Premium Malts 就在這裡釀造。導覽會介紹原料和釀造過程，最後試飲剛做好的啤酒。',
        credit: { author: 'Fuchu', license: 'CC BY-SA 4.0', url: 'https://commons.wikimedia.org/wiki/File:Suntory.musashino.beer.brewery.fuchu.tokyo_01.jpg' },
    },
    ebisu: {
        name: '惠比壽花園廣場', photo: 'photos/ebisu.webp',
        intro: '由札幌啤酒工廠舊址改建的複合設施。塔樓 38 樓的 SKY LOUNGE 免費開放，白天晚上都能看東京市區的景色，傍晚最漂亮。照片是從這棟樓往澀谷、新宿方向拍的。',
        credit: { author: 'Ximonic (Simo Räsänen)', license: 'CC BY-SA 4.0', url: 'https://commons.wikimedia.org/wiki/File:Shibuya_and_Shinjuku_from_Yebisu_Garden_Place_Tower,_Ebisu,_Tokyo,_Japan,_2024_May.jpg' },
    },
    matcha: {
        name: '抹茶甜點', photo: 'photos/matcha.webp', sample: true,
        intro: '東京很多咖啡店把濃抹茶做成蛋糕、布丁和聖代。三軒茶屋的 THREE 是抹茶巴斯克乳酪蛋糕，同區還有抹茶奶油甜甜圈。',
        credit: { author: 'Arnold Gatilao', license: 'CC BY 2.0', url: 'https://commons.wikimedia.org/wiki/File:Tokyo_Parfait_-_lots_of_matcha_with_adzuki_hidden_on_the_bottom._(14226988754).jpg' },
    },
    gyutan: {
        name: '厚切牛舌', photo: 'photos/gyutan.webp', sample: true,
        intro: '源自仙台的炭烤牛舌，通常配麥飯、牛尾湯和山藥泥做成定食。厚切的口感比較有嚼勁，搭檸檬或芥末一起吃。',
        credit: { author: 'Captain76', license: 'Public domain', url: 'https://commons.wikimedia.org/wiki/File:Gyutan_teishoku.JPG' },
    },
    horinji: {
        name: '法輪寺', photo: 'photos/horinji.webp',
        intro: '早稻田站旁的曹洞宗寺院。住持親自設計剪紙御朱印，每個月換新圖案，手水缽也會放季節的花，是近年很紅的御朱印寺。',
        credit: { author: 'Higa4', license: 'CC0', url: 'https://commons.wikimedia.org/wiki/File:H%C5%8Drin-ji_(Nishi-Waseda,_Shinjuku)_02.jpg' },
    },
    kappabashi: {
        name: '合羽橋道具街', photo: 'photos/kappabashi.webp',
        intro: '上野和淺草之間約 800 公尺長的廚具街，賣刀具、餐具和食物模型。飯田屋是這裡的老牌料理道具店，1912 年創業，店內有超過 8,500 種廚具。',
        credit: { author: 'Basile Morin', license: 'CC BY-SA 4.0', url: 'https://commons.wikimedia.org/wiki/File:Kappabashi-dori_streetcorner_(Kitchen_town_-_southern_end)_a_sunny_morning_in_Tokyo_Japan.jpg' },
    },
    ikebukuro: {
        name: '池袋', photo: 'photos/ikebukuro.webp',
        intro: '東京西北邊的大型轉運站，車站兩側是西武和東武百貨。東口的陽光 60 通是購物街，走到底就是有水族館和寶可夢中心的サンシャインシティ。',
        credit: { author: 'mroach', license: 'CC BY-SA 2.0', url: 'https://commons.wikimedia.org/wiki/File:Ikebukuro_3.jpg' },
    },
    izakaya: {
        name: '居酒屋', photo: 'photos/izakaya.webp', sample: true,
        intro: '日本的小酒館，點幾道小菜配酒，當晚餐吃也很划算。多數店入座後會先上一道收費的小菜（お通し），每人約幾百日圓，先有心理準備。',
        credit: { author: 'Nesnad', license: 'CC BY 4.0', url: 'https://commons.wikimedia.org/wiki/File:Inside_various_izakaya_in_Tokyo_-_2024_April_28_various.jpeg' },
    },
};
