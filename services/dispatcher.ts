
// Kamus Domain untuk Analisis Query
const Kamus_Fiqh = new Set([
  'wudhu', 'solat', 'puasa', 'zakat', 'haji', 'nikah', 'talak', 'fasakh', 'faraid', 'jual beli', 'riba', 'gharar', 'maisir', 'jinayah', 'hudud', 'qisas', 'takzir', 'halal', 'haram', 'najis', 'thaharah', 'sertu', 'samak', 'anjing', 'babi', 'sentuh', 'aurat', 'mazhab', 'muamalat',
  'aqiqah', 'kurban', 'nadzar', 'kaffarah', 'ihram', 'tawaf', 'sa\'i', 'wukuf', 'mabit', 'jumrah', 'udhiyah', 'istisqa', 'khusuf', 'kusuf', 'istighfar', 'taubat', 'mahram', 'iddah', 'ruju\'', 'zhihar', 'khulu\'', 'li\'an', 'musyarakah', 'mudharabah', 'murabahah', 'ijarah', 'wakalah', 'kafalah', 'hawalah', 'syirkah', 'bai\' salam', 'bai\' istishna\'', 'riba fadhl', 'riba nasi\'ah', 'ghasab', 'syuf\'ah', 'ihya\'ul mawat', 'luqathah', 'waqaf', 'hibah', 'wasiat', 'dhul khuluq', 'israf', 'tabzir', 'ghibah', 'namimah', 'fitnah', 'riya', 'ujub', 'hasad', 'ghill', 'ilhham', 'waswas', 'tasyabbuh', 'bid\'ah', 'khurafat', 'tahayyul', 'tabarruj', 'khalwat', 'ikhtilat', 'saddu dzarai\'', 'urf', 'maslahah mursalah', 'qiyas', 'istihsan', 'syadz', 'mukhtalif', 'nasikh', 'mansukh', 'ijma\' sukuti', 'qaul shahabi', 'amal ahlil madinah', 'syar\'u man qablana', 'istiqra\'', 'tanqihul manath', 'takhrijul furu\' alal ushul', 'taqlid', 'talfiq', 'taysir', 'tashil'
]);

const Kamus_Fiqh_Primer = new Set([
  'fiqh', 'fiqah', 'syariah', 'syariat', 'hukum', 'fatwa', 'ijtihad', 'usul fiqh', 'maqasid',
  'quran', 'sunnah', 'hadis', 'ijma\'', 'qiyas', 'dalil', 'nash', 'zhahir', 'ta\'wil', 'mansukh', 'nasikh', 'mutawatir', 'ahad', 'shahih', 'hasan', 'dhaif', 'marfu\'', 'mauquf', 'maqthu\'', 'mutawatir ma\'nawi', 'mutawatir lafzhi', 'khabar wahid', 'khabar mutawatir', 'ahkam', 'ibadah', 'muamalat', 'munakahat', 'jinayat', 'siyasah syar\'iyyah', 'khilafah', 'imamah', 'wilayah', 'qadha\'', 'hisbah', 'daulah', 'ummah', 'millah', 'din', 'islam', 'iman', 'ihsan', 'tauhid', 'rububiyyah', 'uluhiyyah', 'asma\' wa sifat', 'aqidah', 'ushuluddin', 'furu\'uddin', 'mazahib arba\'ah', 'hanafi', 'maliki', 'shafi\'i', 'hanbali', 'ahlussunnah wal jama\'ah', 'salaf', 'khalaf', 'tabi\'in', 'sahabat', 'rasul', 'nabi', 'wahyu', 'malaikat', 'kitabullah', 'yaumul akhir', 'qadha\' dan qadar', 'ulumul quran', 'ulumul hadis', 'tafsir', 'syarah', 'takwil', 'tanzil', 'asbabun nuzul', 'naskhul quran', 'muhkam', 'mutasyabih', 'am', 'khash', 'mujmal', 'mubayyan', 'mutlaq', 'muqayyad', 'manthuq', 'mafhum', 'dalalatul iqtiran', 'dalalatul isyarah', 'dalalatul tanbih wal isyarah', 'dalalatul ghayah', 'dalalatul \'umumi', 'dalalatul khusus', 'istishab', 'syar\'u man qablana', 'qaul shahabi', 'maslahah mursalah', 'istihsan', 'urf shahih', 'urf fasid', 'maqasid syariah dharuriyyat', 'maqasid syariah hajiyyat', 'maqasid syariah tahsiniyyat', 'kulliyatul khams'
]);

const Kamus_Falsafah = new Set([
  'ontologi', 'epistemologi', 'metafizik', 'logik', 'etika', 'estetika', 'sebab', 'akibat', 'wujud', 'hakikat', 'aql', 'naql', 'jiwa', 'roh', 'materialisme', 'idealisme', 'eksistensialisme', 'postmodernisme', 'tuhan', 'kewujudan', 'akal',
  'aksiologi', 'filsafat politik', 'filsafat sosial', 'filsafat sejarah', 'filsafat ilmu', 'filsafat bahasa', 'filsafat pikiran', 'filsafat agama', 'fenomenologi', 'hermeneutika', 'dialektika', 'silogisme', 'induksi', 'deduksi', 'abduksi', 'paradigma', 'rasionalisme', 'empirisme', 'skeptisisme', 'nihilisme', 'pluralisme', 'monisme', 'dualisme', 'substansi', 'esensi', 'aksiden', 'kategori', 'transendental', 'apriori', 'aposteriori', 'kontingen', 'niscaya', 'aktualitas', 'potensialitas', 'kebenaran', 'kesalahan', 'validitas', 'soundness', 'koherensi', 'korespondensi', 'pragmatisme', 'utilitarianisme', 'deontologi', 'virtue ethics', 'hedonisme', 'stoikisme', 'sinisme', 'sofisme', 'retorika', 'dialektika materialisme', 'idealisme transendental', 'analitik', 'sintetik', 'logika formal', 'logika informal', 'fallacy', 'argumentum ad hominem', 'argumentum ad verecundiam', 'argumentum ad populum', 'argumentum ad ignorantiam', 'petitio principii', 'non sequitur', 'straw man', 'red herring', 'slippery slope', 'false dichotomy', 'begging the question', 'affirming the consequent', 'denying the antecedent', 'modus ponens', 'modus tollens', 'hipotesis', 'teori', 'model', 'interpretasi', 'pemahaman', 'kesadaran', 'intensionalitas', 'realitas', 'ilusi', 'maya', 'transenden', 'imanen', 'absolut', 'relatif', 'universal', 'partikular', 'konsep', 'kategori', 'predikat', 'subjek', 'proposisi', 'inferensi', 'pembuktian', 'refleksi', 'kontemplasi'
]);

const Kamus_Falsafah_Primer = new Set([
  'falsafah', 'pemikiran', 'filsafat', 'rasional', 'logik', 'argumen', 'teologi', 'kalam',
  'filosof', 'pemikir', 'cendekiawan', 'sarjana', 'hikmah', 'ma\'rifah', 'akl', 'naql', 'wahyu', 'ilmu', 'pengetahuan', 'kebenaran', 'hakikat', 'wujud', 'maujud', 'ghaib', 'syahadah', 'alam', 'kosmos', 'eksistensi', 'esensi', 'substansi', 'aksiden', 'jiwa', 'roh', 'akal budi', 'intuisi', 'pengalaman', 'inferensi', 'deduksi', 'induksi', 'silogisme', 'dialektika', 'metafisika', 'ontologi', 'epistemologi', 'aksiologi', 'etika', 'estetika', 'filsafat ilmu', 'filsafat politik', 'filsafat sosial', 'filsafat agama', 'pemikiran kritis', 'refleksi filosofis', 'spekulasi filosofis', 'argumentasi rasional', 'penyelidikan filosofis', 'tradisi filosofis', 'aliran filosofis', 'mazhab filosofis', 'konsep filosofis', 'teori filosofis', 'prinsip filosofis', 'nilai filosofis', 'makna hidup', 'tujuan hidup', 'kebebasan', 'kewajiban', 'keadilan', 'kebenaran', 'keindahan', 'kebaikan', 'keburukan', 'moralitas', 'etika normatif', 'etika terapan', 'meta-etika', 'logika formal', 'logika informal', 'kesalahan logika', 'paradoks', 'dilema', 'skeptisisme filosofis', 'empirisme filosofis', 'rasionalisme filosofis', 'idealisme filosofis', 'materialisme filosofis', 'eksistensialisme filosofis', 'fenomenologi filosofis', 'hermeneutika filosofis', 'postmodernisme filosofis', 'strukturalisme filosofis', 'pragmatisme filosofis', 'utilitarianisme filosofis', 'deontologi filosofis', 'filsafat timur', 'filsafat barat', 'filsafat kontemporer', 'pemikiran islam', 'pemikiran yunani', 'pemikiran abad pertengahan', 'pemikiran modern', 'pemikiran pascamodern'
]);

const Kamus_Sains = new Set([
  'biologi', 'fizik', 'kimia', 'genetik', 'evolusi', 'dna', 'klon', 'vaksin', 'ai', 'kecerdasan buatan', 'angkasa', 'planet', 'kuantum', 'komputer', 'neurologi', 'alam sekitar', 'perubatan', 'gmo',
  'astronomi', 'geologi', 'antropologi', 'zoologi', 'botani', 'mikrobiologi', 'virologi', 'ekologi', 'paleontologi', 'oceanografi', 'klimatologi', 'astrofisika', 'kosmologi', 'mekanik', 'termodinamika', 'elektromagnetisme', 'optik', 'relativitas', 'nuklir', 'kimia organik', 'kimia anorganik', 'biokimia', 'farmakologi', 'toksikologi', 'nanoteknologi', 'informatika', 'algoritma', 'pemrograman', 'big data', 'machine learning', 'deep learning', 'neural network', 'robotika', 'sensor', 'satelit', 'teleskop', 'roket', 'pesawat ruang angkasa', 'meteoroid', 'asteroid', 'komet', 'galaksi', 'nebula', 'black hole', 'wormhole', 'energi', 'materi', 'ruang', 'waktu', 'gravitasi', 'radiasi', 'gelombang', 'partikel', 'atom', 'molekul', 'sel', 'jaringan', 'organ', 'sistem organ', 'organisme', 'populasi', 'komunitas', 'ekosistem', 'biosfer', 'genom', 'kromosom', 'mutasi', 'seleksi alam', 'adaptasi', 'spesiasi', 'fotosintesis', 'respirasi', 'metabolisme', 'imunologi', 'epidemiologi', 'anatomi', 'fisiologi', 'patologi', 'diagnostik', 'terapeutik', 'bedah', 'farmasi', 'genetika rekayasa', 'bioteknologi', 'rekayasa perangkat lunak', 'rekayasa komputer', 'rekayasa elektro', 'rekayasa mesin', 'rekayasa kimia', 'rekayasa sipil', 'rekayasa material', 'rekayasa industri', 'rekayasa pertanian'
]);

const Kamus_Sains_Primer = new Set([
  'sains', 'saintifik', 'teknologi', 'bukti', 'empirikal', 'kajian', 'data', 'teori', 'hipotesis',
  'eksperimen', 'observasi', 'analisis', 'sintesis', 'metode ilmiah', 'penelitian', 'inovasi', 'penemuan', 'ilmuwan', 'laboratorium', 'instrumentasi', 'validitas', 'reliabilitas', 'signifikansi', 'korelasi', 'kausalitas', 'model', 'simulasi', 'prediksi', 'verifikasi', 'falsifikasi', 'paradigma ilmiah', 'revolusi ilmiah', 'kemajuan ilmiah', 'aplikasi teknologi', 'dampak sosial teknologi', 'etika sains', 'filsafat sains', 'sejarah sains', 'matematika', 'statistik', 'probabilitas', 'logika matematika', 'fisika klasik', 'fisika modern', 'mekanika kuantum', 'teori medan kuantum', 'fisika partikel', 'astrofisika', 'kosmologi', 'kimia dasar', 'kimia lanjutan', 'biologi sel', 'biologi molekuler', 'biologi evolusioner', 'biologi ekologi', 'biologi organisme', 'ilmu komputer', 'rekayasa', 'kedokteran', 'farmasi', 'pertanian', 'lingkungan', 'energi', 'material', 'transportasi', 'komunikasi', 'informasi', 'otomatisasi', 'digitalisasi', 'kecerdasan', 'pembelajaran', 'persepsi', 'aksi', 'interaksi', 'adaptasi', 'organisasi', 'kompleksitas', 'sistem', 'model sistem', 'analisis sistem', 'rekayasa sistem', 'pemodelan', 'optimasi', 'kontrol', 'simulasi', 'visualisasi', 'algoritma', 'struktur data', 'bahasa pemrograman', 'sistem operasi', 'jaringan komputer', 'internet', 'world wide web', 'database', 'keamanan komputer', 'kriptografi', 'grafika komputer', 'pemrosesan citra', 'pemrosesan bahasa alami', 'pengenalan pola', 'visi komputer', 'robotika', 'sensor', 'aktuator', 'kontroler', 'artificial general intelligence', 'superintelligence', 'neuroscience', 'cognitive science', 'psychology', 'sociology', 'economics', 'political science', 'linguistics', 'anthropology'
]);

/**
 * FUNGSI UTAMA: Al_Imam_Dispatcher
 * Menganalisis query pengguna untuk memilih 'loadout' persona yang paling sesuai.
 * @param user_query Pertanyaan dari pengguna.
 * @returns Nama loadout yang terpilih (String).
 */
export function Al_Imam_Dispatcher(user_query: string): string {
    // FASA 1: ANALISIS & EKSTRAKSI KATA KUNCI
    // Membersihkan dan menormalkan kata kunci
    const normalized_keywords = user_query
        .toLowerCase()
        .replace(/[^a-z\s]/g, '') // Hanya abjad dan spasi
        .split(/\s+/)
        .filter(word => word.length > 2); // Abaikan kata-kata pendek

    // FASA 2: PEMBOBOTAN & SKOR DOMAIN
    let score_fiqh = 0;
    let score_falsafah = 0;
    let score_sains = 0;

    for (const keyword of normalized_keywords) {
        if (Kamus_Fiqh.has(keyword)) score_fiqh += 1;
        if (Kamus_Fiqh_Primer.has(keyword)) score_fiqh += 2; // Bonus
        
        if (Kamus_Falsafah.has(keyword)) score_falsafah += 1;
        if (Kamus_Falsafah_Primer.has(keyword)) score_falsafah += 2; // Bonus

        if (Kamus_Sains.has(keyword)) score_sains += 1;
        if (Kamus_Sains_Primer.has(keyword)) score_sains += 2; // Bonus
    }

    // FASA 3: LOGIKA PEMILIHAN LOADOUT
    // Logik 3.1: Kes Dominan Tunggal
    if (score_fiqh > (score_falsafah + score_sains + 2)) {
        return "Loadout Alpha: Majelis Fiqh & Doktrin";
    }
    if (score_falsafah > (score_fiqh + score_sains + 2)) {
        return "Loadout Beta: Simposium Falsafah";
    }
    if (score_sains > (score_fiqh + score_falsafah + 2)) {
        return "Loadout Gamma: Forum Etika Saintifik";
    }

    // Logik 3.2: Kes Hibrid
    if ((score_sains > 0 && score_fiqh > 0) && score_falsafah < 2) {
        return "Loadout Hibrid Gamma-Alpha";
    }

    // Logik 3.3: Fallback (Default)
    return "Loadout Alpha: Majelis Fiqh & Doktrin";
}
