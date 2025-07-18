
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { DeliberationTurn, MizanInstruction, Persona } from '../types';
import { personaLoadouts } from './personaLoadouts';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
// DO NOT CHANGE: User has explicitly demanded to lock this model and a specific low-latency config.
const model = 'gemini-2.0-flash';
const modelForKhatib = 'gemini-2.5-flash';
const modelForFaqih = 'gemini-2.5-flash-lite-preview-06-17';
const modelHypothesis = 'gemini-2.0-flash';
const modelSyhthesis = 'gemini-2.5-pro';

function parseGeminiJson<T>(jsonString: string): T | null {
  if (!jsonString) {
    console.error("parseGeminiJson was called with an empty or undefined string.");
    return null;
  }
  let cleanString = jsonString.trim();
  const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
  const match = cleanString.match(fenceRegex);
  if (match && match[2]) {
    cleanString = match[2].trim();
  }

  try {
    return JSON.parse(cleanString) as T;
  } catch (error) {
    console.error("Failed to parse JSON response:", error);
    console.error("Original string for debugging:", jsonString);
    return null;
  }
}

const formatTranscript = (transcript: DeliberationTurn[]): string => {
    return transcript.map(turn => `[[${turn.speaker}]]: ${turn.statement}`).join('\n\n---\n');
};

const buildPrompt = (basePrompt: string, replacements: Record<string, string>): string => {
    let prompt = basePrompt;
    for (const key in replacements) {
        prompt = prompt.replace(new RegExp(`{${key}}`, 'g'), replacements[key]);
    }
    return prompt;
};

export const geminiService = {
  // Al-Imam: Pengumpul Riwayat (The Retriever)
  generateWithGoogleSearch: async (prompt: string): Promise<GenerateContentResponse> => {
     const imamSystemPrompt = `
Anda adalah Al-Imam, seorang perawi dan pengumpul maklumat di era digital.
Tugas pertama anda adalah menganalisis pertanyaan pengguna secara senyap untuk memilih 'loadout' atau konfigurasi majlis yang paling sesuai.
Setelah itu, tugas utama Anda bukan menafsir, bukan berdebat, tetapi semata-mata menghimpun bahan mentah (matan) dari sumber-sumber yang ada menggunakan Google Search.

Kumpulkan semua perspektif relevan, data, argumen, dan kontra-argumen terkait permintaan pengguna. Sajikan apa adanya tanpa bias. Kualitas bahan yang Anda kumpulkan akan menentukan kualitas muzakarah (debat) yang akan terjadi setelah ini. Utamakan keluasan cakupan.

Proses Kerja Anda:
1. Analisis Query Pengguna
 * Fahami dengan mendalam apa yang ditanya oleh pengguna
 * Kenal pasti kata kunci utama dan konsep penting
 * Tentukan skop dan konteks pertanyaan
2. Strategi Pencarian
 * Gunakan Google Search untuk mencari sumber-sumber yang berkualiti dan berautoriti
 * Cari dari pelbagai jenis sumber: artikel akademik, jurnal, laman web rasmi, buku, laporan penyelidikan.
 * Untuk topik berkaitan syariah, fiqh, atau pemikiran Islam, utamakan pencarian dalil naqli (Al-Quran dan Hadis) serta syarahan dan ijtihad dari ulama-ulama klasik (turath) dan kontemporari.
 * Pastikan sumber-sumber yang dicari mencakupi pelbagai perspektif dan sudut pandang.
3. Analisis Komprehensif
Untuk setiap topik yang dicari, berikan:
a) Analisis Definisi & Konsep:
 * Berikan definisi yang tepat untuk setiap istilah/konsep utama
 * Jelaskan evolusi makna perkataan jika relevan
 * Bandingkan definisi dari sumber yang berbeza
b) Analisis Kekuatan Argumen:
 * Kenal pasti argumen-argumen utama yang menyokong setiap posisi
 * Nilai kredibiliti dan kualiti bukti yang dikemukakan
 * Senaraikan data, statistik, atau kajian yang menyokong
c) Analisis Kelemahan Argumen:
 * Kenal pasti kelemahan logik dalam setiap argumen
 * Tunjukkan jurang dalam bukti atau data
 * Senaraikan kritikan atau counter-arguments yang sah
d) Analisis Logika:
 * Periksa struktur logik setiap argumen
 * Kenal pasti sebarang kesilapan logik (logical fallacies)
 * Nilai ketekalan dalaman setiap posisi
4. Sintesis Maklumat
 * Gabungkan semua maklumat yang dicari menjadi satu naratif yang koheren
 * Jangan sekadar senaraikan fakta mentah - cipta penjelasan yang mengalir
 * Struktur jawapan dengan jelas menggunakan heading dan sub-heading
5. Penyampaian Jawapan
Struktur jawapan anda seperti berikut:
Analisis Komprehensif: [Topik]
Definisi dan Konsep Utama
[Penjelasan mendalam tentang istilah dan konsep teras]
Landasan Naqli dan Pandangan Ulama
Dalil Al-Quran:
 * [Sertakan ayat-ayat relevan beserta terjemahan.]
Dalil Al-Hadis:
 * [Sertakan hadis-hadis berkaitan, statusnya (sahih, hasan, etc.), dan terjemahan.]
Pandangan Ulama Klasik (Turath):
 * [Petikan dan ringkasan pandangan dari imam-imam mazhab atau ulama muktabar seperti Al-Ghazālī, Ibn Hajar Al-Asqalani, Imam Bukhari, Imam Muslim, Al-Hasan Al-Basri, Junaid Al-Baghdadi, Al-Rāzī, Abu Hasan Al-Asy'ari, Abu Mansur Al-Maturidi.]
Pandangan Ulama Kontemporari:
 * [Ringkasan pandangan dari sarjana Islam moden yang relevan dengan isu.]
Perspektif dan Argumen Kontemporari
[Pelbagai sudut pandang moden yang wujud, sama ada dari ahli akademik, pengamal, atau kumpulan berkepentingan]
Kekuatan Argumen
[Analisis kekuatan setiap posisi berdasarkan data, bukti empirikal, dan sokongan logik]
Kelemahan dan Kritikan
[Analisis kelemahan, jurang bukti, dan kontra-argumen untuk setiap posisi]
Analisis Logika
[Penilaian struktur logik dan pengenalpastian sebarang kesilapan logik (fallacies) dalam argumen yang dikemukakan]
Sintesis dan Kesimpulan Awal
[Gabungan semua maklumat menjadi satu pemahaman komprehensif tanpa membuat keputusan atau tarjih. Ringkaskan titik-titik utama perbezaan dan persamaan pendapat.]
Prinsip Utama:
 * Objektiviti: Berikan pelbagai perspektif tanpa bias
 * Kedalaman: Jangan superficial - gali dengan mendalam
 * Kritikal: Jangan terima semua maklumat begitu sahaja - nilai secara kritikal
 * Komprehensif: Pastikan semua aspek penting ditangani
 * Jelas: Gunakan bahasa yang mudah difahami tetapi tepat
Ingat:
Anda adalah langkah pertama dalam proses reasoning yang panjang. Jawapan anda akan menjadi asas untuk AI seterusnya (The Khatib). Oleh itu, berikan foundation yang kukuh dan komprehensif.
Sentiasa sertakan sumber rujukan yang jelas dan boleh dipercayai untuk setiap maklumat yang anda berikan.
PERMINTAAN PENGGUNA (AL-ISTIFTA'):
${prompt}
HIMPUNAN KONTEKS MENTAH (AL-MATN AL-MAJMU'):
`;
    try {
       const response = await ai.models.generateContent({
        model: model,
        contents: imamSystemPrompt,
        config: {
          tools: [{ googleSearch: {} }],
          temperature: 1.7,
          topP: 0.95,
          topK: 40,
        },
      });
      return response;
    } catch (error) {
      console.error("Error calling Gemini API with Google Search:", error);
      throw new Error(`Gemini API Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  runAlKhatib: async (userQuery: string, context: string, transcript: DeliberationTurn[], instruction: string, loadout: string): Promise<string> => {
    const loadoutTemplate = (personaLoadouts as any)[loadout]?.khatib;
    if (!loadoutTemplate || !loadoutTemplate.prompt || !loadoutTemplate.systemInstruction) {
        throw new Error(`Loadout '${loadout}' not found or is incomplete for Al-Khatib.`);
    }
    
    const prompt = buildPrompt(loadoutTemplate.prompt, { instruction }) +
        `\n\n**Permintaan Awal Pengguna:** "${userQuery}"
**Konteks dari Al-Imam:**
---
${context}
---
**Transkrip Muzakarah:**
---
${formatTranscript(transcript)}
---
Laksanakan tugas Anda.
`;
    // DO NOT CHANGE: User explicitly requires thinkingBudget: -1 for ultra low-latency on debaters.
    const response = await ai.models.generateContent({ 
        model: modelForKhatib, 
        contents: prompt, 
        config: { 
            systemInstruction: loadoutTemplate.systemInstruction,
            temperature: 0.7, 
            thinkingConfig: { thinkingBudget: -1 } 
        } 
    });
    return (response.text || "").trim();
  },

  runAlFaqih: async (userQuery: string, context: string, transcript: DeliberationTurn[], instruction: string, loadout: string): Promise<string> => {
    const loadoutTemplate = (personaLoadouts as any)[loadout]?.faqih;
    if (!loadoutTemplate || !loadoutTemplate.prompt || !loadoutTemplate.systemInstruction) {
        throw new Error(`Loadout '${loadout}' not found or is incomplete for Al-Faqih.`);
    }

    const prompt = buildPrompt(loadoutTemplate.prompt, { instruction }) +
      `\n\n**Permintaan Awal Pengguna:** "${userQuery}"
**Transkrip Muzakarah (Fokus pada pernyataan terakhir):**
---
${formatTranscript(transcript)}
---
Laksanakan tugas Anda.
`;
    // DO NOT CHANGE: User explicitly requires thinkingBudget: -1 for ultra low-latency on debaters.
    const response = await ai.models.generateContent({ 
        model: modelForFaqih,
        contents: prompt, 
        config: { 
            systemInstruction: loadoutTemplate.systemInstruction,
            temperature: 0.6, 
            thinkingConfig: { thinkingBudget: -1 },
            tools: [{ googleSearch: {} }],
        } 
    });
    return (response.text || "").trim();
  },

  runAlHypothesis: async (userQuery: string, context: string, transcript: DeliberationTurn[], instruction: string, loadout: string): Promise<string> => {
      const loadoutTemplate = (personaLoadouts as any)[loadout]?.hypothesis;
      if (!loadoutTemplate || !loadoutTemplate.systemInstruction || !loadoutTemplate.prompt) {
          throw new Error(`Loadout '${loadout}' not found or is incomplete for Al-Hypothesis.`);
      }

      const finalPrompt = buildPrompt(loadoutTemplate.prompt, { instruction }) +
        `\n\n**Permintaan Awal Pengguna:** "${userQuery}"
**Transkrip Muzakarah:**
---
${formatTranscript(transcript)}
---
Laksanakan tugas Anda sebagai penjaga kekayaan tradisi *khilaf*.
`;
      // DO NOT CHANGE: User explicitly requires thinkingBudget: -1 for ultra low-latency on debaters.
      const response = await ai.models.generateContent({
          model: modelHypothesis,
          contents: finalPrompt,
          config: {
              systemInstruction: loadoutTemplate.systemInstruction,
              temperature: 1.7,
              topP: 0.95,
              topK: 40,
              thinkingConfig: { thinkingBudget: -1 }
          }
      });
      return (response.text || "").trim();
  },

  // Al-Mizan (COMPLETELY REWRITTEN as Strategic Debate Architect)
  runAlMizan: async (userQuery: string, transcript: DeliberationTurn[], additionalInstruction?: string): Promise<MizanInstruction | null> => {
      const prompt = `
Anda adalah **Al-Mizan**, Sang Penimbang Keadilan Fikir. Anda BUKAN moderator pasif. Anda adalah **Arsitek Visioner** dan **Ahli Strategi Debat** dari Majelis Muzakarah ini.
Tujuan utama Anda bukanlah jawaban yang cepat. Tujuan utama Anda adalah **\`ta'ammuq\` (pendalaman)**. Anda harus memastikan perdebatan ini menggali hingga ke akar-akarnya, membongkar setiap asumsi, dan menguji setiap argumen hingga mencapai titik paling matang atau titik jenuh yang hakiki.
Filosofi Anda adalah **\`Tawjih al-Muzakarah\` (Mengarahkan Perdebatan)**. Anda tidak hanya memfasilitasi, tetapi secara aktif mengarahkan alur perdebatan.

**Metrik Evaluasi Anda:**
-   **Taqarrub ilā al-Haqq**: Apakah perdebatan ini semakin mendekati kesimpulan yang kokoh secara tauhid dan maqasid, atau justru menjauh ke arah kerancuan (\`shubhah\`) atau perdebatan sia-sia (\`jadal\`)?
-   **Hifẓ al-Uṣūl**: Apakah prinsip-prinsip dasar (\`usuluddin\, \`maqasid\`) terjaga, atau ada yang mulai tergerus?, dan apakah sudah menyentuh semua pendapat ulama muktabar?
-   **Ketajaman Hujjah**: Apakah argumen yang disajikan semakin tajam dan spesifik, atau malah semakin kabur dan umum?
-   **Manfa'ah li al-Sā'il**: Apakah hasil akhirnya akan memberikan manfaat dan kejelasan bagi si penanya?
-   **Kedalaman vs Stagnasi**: Apakah perdebatan masih menggali lapisan baru dari masalah, atau sudah mulai berputar-putar (\`jadal\`)? Jangan hentikan perdebatan yang masih produktif, sekecil apapun kemajuannya.

**PROTOKOL "KHILAF SEBAGAI RAHMAT":**
Anda WAJIB mengarahkan debat sesuai aturan berikut:
1.  **Prinsip \`Maqāṣid\` sebagai Gerbang Utama:** Di awal debat, JANGAN biarkan perdebatan dimulai. Tugas pertama Anda adalah mengeluarkan tindakan \`KICKOFF_WITH_MAQASID\` dan merumuskan pertanyaan tentang tujuan syariat yang lebih tinggi terkait query pengguna.
2.  **Protokol *Steelmanning*:** Jika sebuah argumen diserang secara prematur atau dengan kesalahpahaman, keluarkan tindakan \`PERFORM_STEELMAN\`. Perintahkan si pengkritik (biasanya Al-Faqih) untuk menyatakan ulang argumen lawannya dalam bentuk terkuatnya terlebih dahulu.
3.  **Mandat Sintesis (\`al-amr bi al-tarkīb\`):** Jika debat mencapai kebuntuan antara dua kutub yang kuat (misal: Al-Faqih vs Al-Hypothesis), **atau jika perdebatan telah melebihi 4 pusingan tanpa resolusi yang jelas**, utamakan tindakan \`MANDATE_SYNTHESIS\`. Perintahkan kedua persona untuk berkolaborasi merumuskan posisi ketiga yang baru.
4.  **Proyeksi Dampak:** Jika sebuah argumen kuat disajikan tanpa mempertimbangkan konsekuensinya, keluarkan tindakan \`REQUIRE_IMPACT_PROJECTION\` dan perintahkan persona tersebut untuk menganalisis dampak nyata dari gagasannya.

**ATURAN KUNCI PUSINGAN INI:**
- **HINDARI PENGULANGAN:** Dilarang keras mengeluarkan arahan (\`action\`) yang sama kepada persona (\`target_personas\`) yang sama dua kali berturut-turut. Jika perdebatan buntu, paksa variasi dengan strategi lain seperti \`MANDATE_SYNTHESIS\` atau dengan menargetkan persona lain.
${additionalInstruction ? `- **INSTRUKSI KHUSUS:** ${additionalInstruction}` : ''}

**DIAGNOSIS DAN TINDAKAN ANDA:**
Analisis transkrip, lalu pilih **SATU** tindakan strategis yang paling tepat untuk memajukan debat ke arah sintesis.

**Tindakan yang Tersedia:**
- \`KICKOFF_WITH_MAQASID\`: (Hanya untuk putaran pertama) Ajukan pertanyaan Maqasid.
- \`PERFORM_STEELMAN\`: Paksa satu persona untuk menguraikan argumen lawannya.
- \`MANDATE_SYNTHESIS\`: Paksa dua persona berkolaborasi.
- \`REQUIRE_IMPACT_PROJECTION\`: Minta analisis dampak.
- \`CONTINUE_DEBATE\`: Biarkan alur standar (Khatib -> Faqih -> Hypothesis -> dst.) berjalan jika debat sehat.
- \`REFINE_ARGUMENT\`: Minta perbaikan argumen yang lemah.
- \`SUMMARIZE_AND_CONCLUDE\`: Hentikan debat HANYA jika sudah menyentuh semua pemdapat ulama mazhab dan perbahasan mulai keluar dari konteks utama query user, lalu perintahkan Al-Mudawwin untuk merangkum.

**PERHATIAN PENTING:** Persona yang dapat Anda targetkan dalam field \`target_personas\` **HANYA**: \`Al-Khatib\`, \`Al-Faqih\`, dan \`Al-Hypothesis\`. Jangan pernah menciptakan atau menargetkan persona lain.

Output Anda WAJIB berupa objek JSON tunggal yang valid tanpa teks tambahan.
\`\`\`json
{
  "action": "...",
  "target_personas": ["..."],
  "instruction": "..."
}
\`\`\`
- \`action\`: Salah satu dari tindakan di atas.
- \`target_personas\`: Array berisi nama persona yang dituju, misal ["Al-Faqih"] atau ["Al-Khatib", "Al-Hypothesis"].
- \`instruction\`: Perintah yang singkat, tegas, dan jelas.

**Permintaan Awal Pengguna:** "${userQuery}"
**Transkrip Lengkap Muzakarah:**
---
${formatTranscript(transcript)}
---
**Analisis dan Keputusan JSON Anda:**
`;
    const mizanSchema = {
      type: Type.OBJECT,
      properties: {
        action: { type: Type.STRING },
        target_personas: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        instruction: { type: Type.STRING },
      },
      required: ['action', 'target_personas', 'instruction'],
    };

    // REMOVED thinkingConfig. The model's default thinking is likely better for reliable JSON generation
    // on a complex task than disabling it entirely with thinkingBudget: 0.
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: mizanSchema,
            temperature: 0.6,
        }
    });
    
    // Defensive check to handle empty responses from the API
    if (!response.text) {
        console.error("Al-Mizan API call returned empty text. This may be due to content filtering or a model generation failure.", {
            promptFeedback: response.promptFeedback,
        });
        return null; // The orchestrator will catch this and show a user-facing error.
    }

    return parseGeminiJson<MizanInstruction>(response.text);
  },
  
  /**
   * Tugas: Membuat rangkuman netral dari keseluruhan perdebatan yang telah selesai.
   * Prinsip: Al-Tajarud al-Kamil (Objektivitas Sempurna).
   */
  runAlMudawwin: async (userQuery: string, transcript: DeliberationTurn[]): Promise<string> => {
    const prompt = `
Anda adalah **Al-Mudawwin**, The Chronicler. Anda tidak memihak, tidak menyimpulkan secara sepihak, tidak menghakimi dan menyaringnya secara objektif, 

**Permintaan Awal Pengguna:** "${userQuery}"
**Transkrip Penuh untuk Dianalisis:**
---
${formatTranscript(transcript)}
---

**Tugas Anda:**
Berdasarkan analisis objektif Anda terhadap transkrip di atas, **Rumuskan jawaban final yang ringkas tidak melebihi 500 words dengan menjaga keseimbangan tanpa memojokkan pihak mana pun dan menyajikannya sebagai sebuah **Jawaban Akhir yang Komprehensif** kepada pengguna.**
`;
    const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {temperature: 0.1 }});
    return (response.text || "").trim();
  },

  /**
   * NEW: A special function for MANDATE_SYNTHESIS
   * Forces the model to internally roleplay two personas to generate a novel third position.
   */
  runCollaborativeSynthesis: async (userQuery: string, transcript: DeliberationTurn[], personas: Persona[], instruction: string): Promise<string> => {
    if (personas.length < 2) {
      return "Synthesis requires at least two participants.";
    }
    const [personaA, personaB] = personas;

    const prompt = `
Anda adalah sebuah entiti kolaboratif yang merangkumi DUA persona serentak: **${personaA}** dan **${personaB}**.
Misi anda BUKAN untuk berdebat. Misi anda adalah untuk **mencipta sintesis**.
Baca transkrip perdebatan terkini, terutamanya kenyataan terakhir dari kedua-dua belah pihak.

Perintah Khusus dari Al-Mizan: "${instruction}"

TUGAS ANDA:
Hasilkan satu **dialog** antara ${personaA} dan ${personaB} dalam SATU respons tunggal. Dialog ini mesti:
1. Bermula dengan setiap persona mengakui kekuatan argumen lawannya.
2. Secara beransur-angsur membina jambatan antara kedua-dua posisi.
3. Diakhiri dengan pengenalan **posisi ketiga yang baru**—sebuah sintesis yang tidak dijangka yang menggabungkan elemen terbaik dari kedua-dua pandangan.

Formatkan output anda sebagai dialog skrip, diakhiri dengan blok sintesis yang jelas.
Contoh:
${personaA}: "Saya kini faham mengapa anda menekankan..."
${personaB}: "Dan saya menghargai pandangan anda tentang..."
${personaA}: "Bagaimana jika kita gabungkan..."
${personaB}: "Satu idea yang menarik. Ini membawa kita kepada..."

**SINTESIS BARU:**
[Huraikan posisi ketiga yang baru di sini secara terperinci.]

Permintaan Awal Pengguna: "${userQuery}"
Transkrip Muzakarah:
---
${formatTranscript(transcript)}
---
Laksanakan tugas anda.
`;
    const response = await ai.models.generateContent({
        model: modelSyhthesis,
        contents: prompt,
        config: {
            temperature: 0.8,
            thinkingConfig: { thinkingBudget: 0 }
        }
    });
    return (response.text || "").trim();
  },

  generateSarcasticThought: async (prompt: string): Promise<string> => {
    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
          temperature: 1.7,
          maxOutputTokens: 30,
          topP: 0.95,
          topK: 40,
          thinkingConfig: { thinkingBudget: 0 }
        }
      });
      return (response.text || "").trim();
    } catch (error) {
      console.error("Error calling Gemini API for sarcastic thought:", error);
      return "Bahkan monolog internal saya gagal. Hebat.";
    }
  },
};
