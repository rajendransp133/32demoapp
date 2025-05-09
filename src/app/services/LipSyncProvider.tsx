class LipsyncEn {
  rules: any;
  visemeDurations: any;
  specialDurations: any;
  digits: string[];
  ones: string[];
  tens: string[];
  teens: string[];
  symbols: Record<string, string>;
  symbolsReg: RegExp;
  espeakToOculusViseme: Record<string, string>;
  punctuation: Record<string, number>;

  constructor() {
    this.rules = {
      A: [
        "[A] =aa",
        " [ARE] =aa RR",
        " [AR]O=aa RR",
        "[AR]#=E RR",
        " ^[AS]#=E SS",
        "[A]WA=aa",
        "[AW]=aa",
        " :[ANY]=E nn I",
        "[A]^+#=E",
        "#:[ALLY]=aa nn I",
        " [AL]#=aa nn",
        "[AGAIN]=aa kk E nn",
        "#:[AG]E=I kk",
        "[A]^+:#=aa",
        ":[A]^+ =E",
        "[A]^%=E",
        " [ARR]=aa RR",
        "[ARR]=aa RR",
        " :[AR] =aa RR",
        "[AR] =E",
        "[AR]=aa RR",
        "[AIR]=E RR",
        "[AI]=E",
        "[AY]=E",
        "[AU]=aa",
        "#:[AL] =aa nn",
        "#:[ALS] =aa nn SS",
        "[ALK]=aa kk",
        "[AL]^=aa nn",
        " :[ABLE]=E PP aa nn",
        "[ABLE]=aa PP aa nn",
        "[ANG]+=E nn kk",
        "[A]=aa",
      ],

      B: [
        " [BE]^#=PP I",
        "[BEING]=PP I I nn",
        " [BOTH] =PP O TH",
        " [BUS]#=PP I SS",
        "[BUIL]=PP I nn",
        "[B]=PP",
      ],

      C: [
        " [CH]^=kk",
        "^E[CH]=kk",
        "[CH]=CH",
        " S[CI]#=SS aa",
        "[CI]A=SS",
        "[CI]O=SS",
        "[CI]EN=SS",
        "[C]+=SS",
        "[CK]=kk",
        "[COM]%=kk aa PP",
        "[C]=kk",
      ],

      D: [
        "#:[DED] =DD I DD",
        ".E[D] =DD",
        "#^:E[D] =DD",
        " [DE]^#=DD I",
        " [DO] =DD U",
        " [DOES]=DD aa SS",
        " [DOING]=DD U I nn",
        " [DOW]=DD aa",
        "[DU]A=kk U",
        "[D]=DD",
      ],

      E: [
        "#:[E] =",
        "'^:[E] =",
        " :[E] =I",
        "#[ED] =DD",
        "#:[E]D =",
        "[EV]ER=E FF",
        "[E]^%=I",
        "[ERI]#=I RR I",
        "[ERI]=E RR I",
        "#:[ER]#=E",
        "[ER]#=E RR",
        "[ER]=E",
        " [EVEN]=I FF E nn",
        "#:[E]W=",
        "@[EW]=U",
        "[EW]=I U",
        "[E]O=I",
        "#:&[ES] =I SS",
        "#:[E]S =",
        "#:[ELY] =nn I",
        "#:[EMENT]=PP E nn DD",
        "[EFUL]=FF U nn",
        "[EE]=I",
        "[EARN]=E nn",
        " [EAR]^=E",
        "[EAD]=E DD",
        "#:[EA] =I aa",
        "[EA]SU=E",
        "[EA]=I",
        "[EIGH]=E",
        "[EI]=I",
        " [EYE]=aa",
        "[EY]=I",
        "[EU]=I U",
        "[E]=E",
      ],

      F: ["[FUL]=FF U nn", "[F]=FF"],

      G: [
        "[GIV]=kk I FF",
        " [G]I^=kk",
        "[GE]T=kk E",
        "SU[GGES]=kk kk E SS",
        "[GG]=kk",
        " B#[G]=kk",
        "[G]+=kk",
        "[GREAT]=kk RR E DD",
        "#[GH]=",
        "[G]=kk",
      ],

      H: [
        " [HAV]=I aa FF",
        " [HERE]=I I RR",
        " [HOUR]=aa EE",
        "[HOW]=I aa",
        "[H]#=I",
        "[H]=",
      ],

      I: [
        " [IN]=I nn",
        " [I] =aa",
        "[IN]D=aa nn",
        "[IER]=I E",
        "#:R[IED] =I DD",
        "[IED] =aa DD",
        "[IEN]=I E nn",
        "[IE]T=aa E",
        " :[I]%=aa",
        "[I]%=I",
        "[IE]=I",
        "[I]^+:#=I",
        "[IR]#=aa RR",
        "[IZ]%=aa SS",
        "[IS]%=aa SS",
        "[I]D%=aa",
        "+^[I]^+=I",
        "[I]T%=aa",
        "#^:[I]^+=I",
        "[I]^+=aa",
        "[IR]=E",
        "[IGH]=aa",
        "[ILD]=aa nn DD",
        "[IGN] =aa nn",
        "[IGN]^=aa nn",
        "[IGN]%=aa nn",
        "[IQUE]=I kk",
        "[I]=I",
      ],

      J: ["[J]=kk"],

      K: [" [K]N=", "[K]=kk"],

      L: ["[LO]C#=nn O", "L[L]=", "#^:[L]%=aa nn", "[LEAD]=nn I DD", "[L]=nn"],

      M: ["[MOV]=PP U FF", "[M]=PP"],

      N: [
        "E[NG]+=nn kk",
        "[NG]R=nn kk",
        "[NG]#=nn kk",
        "[NGL]%=nn kk aa nn",
        "[NG]=nn",
        "[NK]=nn kk",
        " [NOW] =nn aa",
        "[N]=nn",
      ],

      O: [
        "[OF] =aa FF",
        "[OROUGH]=E O",
        "#:[OR] =E",
        "#:[ORS] =E SS",
        "[OR]=aa RR",
        " [ONE]=FF aa nn",
        "[OW]=O",
        " [OVER]=O FF E",
        "[OV]=aa FF",
        "[O]^%=O",
        "[O]^EN=O",
        "[O]^I#=O",
        "[OL]D=O nn",
        "[OUGHT]=aa DD",
        "[OUGH]=aa FF",
        " [OU]=aa",
        "H[OU]S#=aa",
        "[OUS]=aa SS",
        "[OUR]=aa RR",
        "[OULD]=U DD",
        "^[OU]^L=aa",
        "[OUP]=U OO",
        "[OU]=aa",
        "[OY]=O",
        "[OING]=O I nn",
        "[OI]=O",
        "[OOR]=aa RR",
        "[OOK]=U kk",
        "[OOD]=U DD",
        "[OO]=U",
        "[O]E=O",
        "[O] =O",
        "[OA]=O",
        " [ONLY]=O nn nn I",
        " [ONCE]=FF aa nn SS",
        "[ON'T]=O nn DD",
        "C[O]N=aa",
        "[O]NG=aa",
        " ^:[O]N=aa",
        "I[ON]=aa nn",
        "#:[ON] =aa nn",
        "#^[ON]=aa nn",
        "[O]ST =O",
        "[OF]^=aa FF",
        "[OTHER]=aa TH E",
        "[OSS] =aa SS",
        "#^:[OM]=aa PP",
        "[O]=aa",
      ],

      P: [
        "[PH]=FF",
        "[PEOP]=PP I PP",
        "[POW]=PP aa",
        "[PUT] =PP U DD",
        "[P]=PP",
      ],

      Q: ["[QUAR]=kk FF aa RR", "[QU]=kk FF", "[Q]=kk"],

      R: [" [RE]^#=RR I", "[R]=RR"],

      S: [
        "[SH]=SS",
        "#[SION]=SS aa nn",
        "[SOME]=SS aa PP",
        "#[SUR]#=SS E",
        "[SUR]#=SS E",
        "#[SU]#=SS U",
        "#[SSU]#=SS U",
        "#[SED] =SS DD",
        "#[S]#=SS",
        "[SAID]=SS E DD",
        "^[SION]=SS aa nn",
        "[S]S=",
        ".[S] =SS",
        "#:.E[S] =SS",
        "#^:##[S] =SS",
        "#^:#[S] =SS",
        "U[S] =SS",
        " :#[S] =SS",
        " [SCH]=SS kk",
        "[S]C+=",
        "#[SM]=SS PP",
        "#[SN]'=SS aa nn",
        "[S]=SS",
      ],

      T: [
        " [THE] =TH aa",
        "[TO] =DD U",
        "[THAT] =TH aa DD",
        " [THIS] =TH I SS",
        " [THEY]=TH E",
        " [THERE]=TH E RR",
        "[THER]=TH E",
        "[THEIR]=TH E RR",
        " [THAN] =TH aa nn",
        " [THEM] =TH E PP",
        "[THESE] =TH I SS",
        " [THEN]=TH E nn",
        "[THROUGH]=TH RR U",
        "[THOSE]=TH O SS",
        "[THOUGH] =TH O",
        " [THUS]=TH aa SS",
        "[TH]=TH",
        "#:[TED] =DD I DD",
        "S[TI]#N=CH",
        "[TI]O=SS",
        "[TI]A=SS",
        "[TIEN]=SS aa nn",
        "[TUR]#=CH E",
        "[TU]A=CH U",
        " [TWO]=DD U",
        "[T]=DD",
      ],

      U: [
        " [UN]I=I U nn",
        " [UN]=aa nn",
        " [UPON]=aa PP aa nn",
        "@[UR]#=U RR",
        "[UR]#=I U RR",
        "[UR]=E",
        "[U]^ =aa",
        "[U]^^=aa",
        "[UY]=aa",
        " G[U]#=",
        "G[U]%=",
        "G[U]#=FF",
        "#N[U]=I U",
        "@[U]=I",
        "[U]=I U",
      ],

      V: ["[VIEW]=FF I U", "[V]=FF"],

      W: [
        " [WERE]=FF E",
        "[WA]S=FF aa",
        "[WA]T=FF aa",
        "[WHERE]=FF E RR",
        "[WHAT]=FF aa DD",
        "[WHOL]=I O nn",
        "[WHO]=I U",
        "[WH]=FF",
        "[WAR]=FF aa RR",
        "[WOR]^=FF E",
        "[WR]=RR",
        "[W]=FF",
      ],

      X: [" [X]=SS", "[X]=kk SS"],

      Y: [
        "[YOUNG]=I aa nn",
        " [YOU]=I U",
        " [YES]=I E SS",
        " [Y]=I",
        "#^:[Y] =I",
        "#^:[Y]I=I",
        " :[Y] =aa",
        " :[Y]#=aa",
        " :[Y]^+:#=I",
        " :[Y]^#=I",
        "[Y]=I",
      ],

      Z: ["[Z]=SS"],
    };

    const ops = {
      "#": "[AEIOUY]+", // One or more vowels AEIOUY
      // This one is not used: "'": '[BCDFGHJKLMNPQRSTVWXZ]+', // One or more consonants BCDFGHJKLMNPQRSTVWXZ
      ".": "[BDVGJLMNRWZ]", // One voiced consonant BDVGJLMNRWZ
      // This one is not used: '$': '[BDVGJLMNRWZ][EI]', // One consonant followed by E or I
      "%": "(?:ER|E|ES|ED|ING|ELY)", // One of ER, E, ES, ED, ING, ELY
      "&": "(?:[SCGZXJ]|CH|SH)", // One of S, C, G, Z, X, J, CH, SH
      "@": "(?:[TSRDLZNJ]|TH|CH|SH)", // One of T, S, R, D, L, Z, N, J, TH, CH, SH
      "^": "[BCDFGHJKLMNPQRSTVWXZ]", // One consonant BCDFGHJKLMNPQRSTVWXZ
      "+": "[EIY]", // One of E, I, Y
      ":": "[BCDFGHJKLMNPQRSTVWXZ]*", // Zero or more consonants BCDFGHJKLMNPQRSTVWXZ
      " ": "\\b", // Start/end of the word
    };

    // Convert rules to regex
    Object.keys(this.rules).forEach((key) => {
      this.rules[key] = this.rules[key].map((rule) => {
        const posL = rule.indexOf("[");
        const posR = rule.indexOf("]");
        const posE = rule.indexOf("=");
        const strLeft = rule.substring(0, posL);
        const strLetters = rule.substring(posL + 1, posR);
        const strRight = rule.substring(posR + 1, posE);
        const strVisemes = rule.substring(posE + 1);

        const o = { regex: "", move: 0, visemes: [] };

        let exp = "";
        exp += [...strLeft].map((x) => ops[x] || x).join("");
        const ctxLetters = [...strLetters];
        ctxLetters[0] = ctxLetters[0].toLowerCase();
        exp += ctxLetters.join("");
        o.move = ctxLetters.length;
        exp += [...strRight].map((x) => ops[x] || x).join("");
        o.regex = new RegExp(exp) as any;

        if (strVisemes.length) {
          strVisemes.split(" ").forEach((viseme) => {
            o.visemes.push(viseme);
          });
        }

        return o;
      });
    });

    // Viseme durations in relative unit (1=average)
    // TODO: Check for statistics for English
    this.visemeDurations = {
      aa: 0.95,
      E: 0.9,
      I: 0.92,
      O: 0.96,
      U: 0.95,
      PP: 1.08,
      SS: 1.23,
      TH: 1,
      DD: 1.05,
      FF: 1.0,
      kk: 1.21,
      nn: 0.88,
      RR: 0.88,
      sil: 1,
    };

    // Pauses in relative units (1=average)
    this.specialDurations = { " ": 1, ",": 3, "-": 0.5, "'": 0.5 };

    // English number words
    this.digits = [
      "oh",
      "one",
      "two",
      "three",
      "four",
      "five",
      "six",
      "seven",
      "eight",
      "nine",
    ];
    this.ones = [
      "",
      "one",
      "two",
      "three",
      "four",
      "five",
      "six",
      "seven",
      "eight",
      "nine",
    ];
    this.tens = [
      "",
      "",
      "twenty",
      "thirty",
      "forty",
      "fifty",
      "sixty",
      "seventy",
      "eighty",
      "ninety",
    ];
    this.teens = [
      "ten",
      "eleven",
      "twelve",
      "thirteen",
      "fourteen",
      "fifteen",
      "sixteen",
      "seventeen",
      "eighteen",
      "nineteen",
    ];

    // Symbols to English
    this.symbols = {
      "%": "percent",
      "€": "euros",
      "&": "and",
      "+": "plus",
      $: "dollars",
    };
    this.symbolsReg = /[%€&\+\$]/g;

    // IPA to Oculus viseme mapping
    this.espeakToOculusViseme = {
      // Vowels
      iː: "I",
      ɪ: "I",
      e: "E",
      æ: "aa",
      aː: "aa",
      ɒ: "O",
      ɔː: "O",
      ʊ: "U",
      uː: "U",
      ʌ: "aa",
      ə: "E",

      // Diphthongs
      eɪ: "E",
      aɪ: "I",
      ɔɪ: "O",
      aʊ: "O",
      oʊ: "O",
      ɪə: "I",
      eə: "E",
      ʊə: "U",

      // Consonants
      p: "PP",
      b: "PP",
      t: "DD",
      d: "DD",
      k: "kk",
      g: "kk",
      tʃ: "CH",
      dʒ: "CH",
      f: "FF",
      v: "FF",
      θ: "TH",
      ð: "TH",
      s: "SS",
      z: "SS",
      ʃ: "SS",
      ʒ: "SS",
      h: "sil",
      m: "PP",
      n: "nn",
      ŋ: "nn",
      l: "DD",
      r: "RR",
      ɹ: "RR",
      ɾ: "RR",
      w: "U",
      j: "I",

      // Additional phonemes for other languages
      ɑ: "aa",
      ɑː: "aa",
      ɐ: "aa",
      ɜ: "E",
      ø: "E",
      y: "I",
      eː: "E",
      œ: "E",
      ɶ: "aa",
      ɒ̃: "O",
      ã: "aa",
      õ: "O",
      ɲ: "nn",
      ʎ: "nn",
      ʍ: "U",
      ç: "SS",
      x: "kk",
      ɣ: "kk",
      β: "FF",
      ʔ: "sil",
      ʕ: "sil",
      ɬ: "SS",
      ɮ: "SS",
      ʢ: "sil",
      ʡ: "sil",
      ɖ: "DD",
      ɗ: "DD",
      ʄ: "DD",
      ɟ: "DD",
      ɠ: "kk",
      ʛ: "kk",
    };

    // Punctuation to be preserved
    this.punctuation = {
      ";": 1,
      ":": 1,
      ",": 1,
      ".": 1,
      "!": 1,
      "?": 1,
      "¡": 1,
      "¿": 1,
      "—": 1,
      '"': 1,
      "…": 1,
      "«": 1,
      "»": 1,
      "(": 1,
      ")": 1,
      "{": 1,
      "}": 1,
      "[": 1,
      "]": 1,
    };
  }

  convert_digit_by_digit(num: string) {
    const numArray = num.split("");
    let numWords = "";
    for (let m = 0; m < numArray.length; m++) {
      numWords += this.digits[numArray[m]] + " ";
    }
    numWords = numWords.substring(0, numWords.length - 1); //kill final space
    return numWords;
  }

  convert_sets_of_two(num: string) {
    let firstNumHalf = String(num).substring(0, 2);
    let secondNumHalf = String(num).substring(2, 4);
    let numWords = this.convert_tens(firstNumHalf);
    numWords += " " + this.convert_tens(secondNumHalf);
    return numWords;
  }

  convert_millions(num: string) {
    if (Number(num) >= 1000000) {
      return (
        this.convert_millions(Math.floor(Number(num) / 1000000).toString()) +
        " million " +
        this.convert_thousands((Number(num) % 1000000).toString())
      );
    } else {
      return this.convert_thousands(num);
    }
  }

  convert_thousands(num: string) {
    if (Number(num) >= 1000) {
      return (
        this.convert_hundreds(Math.floor(Number(num) / 1000).toString()) +
        " thousand " +
        this.convert_hundreds((Number(num) % 1000).toString())
      );
    } else {
      return this.convert_hundreds(num);
    }
  }

  convert_hundreds(num: string) {
    if (Number(num) > 99) {
      return (
        this.ones[Math.floor(Number(num) / 100)] +
        " hundred " +
        this.convert_tens((Number(num) % 100).toString())
      );
    } else {
      return this.convert_tens(num);
    }
  }

  convert_tens(num: string) {
    if (Number(num) < 10) {
      return (
        (Number(num) != 0 && num.toString().startsWith("0") ? "oh " : "") +
        this.ones[Number(num)]
      );
    } else if (Number(num) >= 10 && Number(num) < 20) {
      return this.teens[Number(num) - 10];
    } else {
      return (
        this.tens[Math.floor(Number(num) / 10)] +
        " " +
        this.ones[Number(num) % 10]
      );
    }
  }

  convertNumberToWords(num: string) {
    if (num == "0") {
      return "zero";
    } else if (num.startsWith("0")) {
      return this.convert_digit_by_digit(num);
    } else if (
      (Number(num) < 1000 && Number(num) > 99) ||
      (Number(num) > 10000 && Number(num) < 1000000)
    ) {
      //read area and zip codes digit by digit
      return this.convert_digit_by_digit(num);
    } else if (
      (Number(num) > 1000 && Number(num) < 2000) ||
      (Number(num) > 2009 && Number(num) < 3000)
    ) {
      //read years as two sets of two digits
      return Number(num) % 100 != 0
        ? this.convert_sets_of_two(num)
        : this.convert_tens(num.substring(0, 2)) + " hundred";
    } else {
      return this.convert_millions(num);
    }
  }

  preProcessText(s: string) {
    return s
      .replace(/[#_*":;]/g, "")
      .replace(this.symbolsReg, (symbol) => {
        return " " + this.symbols[symbol] + " ";
      })
      .replace(/(\d)\.(\d)/g, "$1 point $2") // Number separator
      .replace(/\d+/g, this.convertNumberToWords.bind(this)) // Numbers to words
      .replace(/(\D)\1\1+/g, "$1$1") // max 2 repeating chars
      .replaceAll("  ", " ") // Only one repeating space
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .normalize("NFC") // Remove non-English diacritics
      .trim();
  }

  wordsToVisemes(w: string) {
    let o = {
      words: w.toUpperCase(),
      visemes: [],
      times: [],
      durations: [],
      i: 0,
    };
    let t = 0;

    const chars = [...o.words];
    while (o.i < chars.length) {
      const c = chars[o.i];
      const ruleset = this.rules[c];
      if (ruleset) {
        for (let i = 0; i < ruleset.length; i++) {
          const rule = ruleset[i];
          const test =
            o.words.substring(0, o.i) +
            c.toLowerCase() +
            o.words.substring(o.i + 1);
          let matches = test.match(rule.regex);
          if (matches) {
            rule.visemes.forEach((viseme) => {
              if (
                o.visemes.length &&
                o.visemes[o.visemes.length - 1] === viseme
              ) {
                const d = 0.7 * (this.visemeDurations[viseme] || 1);
                o.durations[o.durations.length - 1] += d;
                t += d;
              } else {
                const d = this.visemeDurations[viseme] || 1;
                o.visemes.push(viseme);
                o.times.push(t);
                o.durations.push(d);
                t += d;
              }
            });
            o.i += rule.move;
            break;
          }
        }
      } else {
        o.i++;
        t += this.specialDurations[c] || 0;
      }
    }

    return o;
  }
}

class LipsyncTa {
  rules: any;
  visemeDurations: any;
  specialDurations: any;
  digits: string[];
  tens: string[];
  hundreds: string[];
  thousands: string;
  lakhs: string;
  crores: string;
  symbols: Record<string, string>;
  symbolsReg: RegExp;

  constructor() {
    this.rules = {
      அ: [{ regex: /அ/, move: 1, visemes: ["aa"] }], // a
      ஆ: [{ regex: /ஆ/, move: 1, visemes: ["aa"] }], // aa
      இ: [{ regex: /இ/, move: 1, visemes: ["I"] }], // i
      ஈ: [{ regex: /ஈ/, move: 1, visemes: ["I"] }], // ii
      உ: [{ regex: /உ/, move: 1, visemes: ["U"] }], // u
      ஊ: [{ regex: /ஊ/, move: 1, visemes: ["U"] }], // uu
      எ: [{ regex: /எ/, move: 1, visemes: ["E"] }], // e
      ஏ: [{ regex: /ஏ/, move: 1, visemes: ["E"] }], // ee
      ஐ: [{ regex: /ஐ/, move: 1, visemes: ["aa", "I"] }], // ai
      ஒ: [{ regex: /ஒ/, move: 1, visemes: ["O"] }], // o
      ஓ: [{ regex: /ஓ/, move: 1, visemes: ["O"] }], // oo
      ஔ: [{ regex: /ஔ/, move: 1, visemes: ["aa", "U"] }], // au

      க்: [{ regex: /க்/, move: 1, visemes: ["kk"] }], // k
      ங்: [{ regex: /ங்/, move: 1, visemes: ["nn", "kk"] }], // ng
      ச்: [{ regex: /ச்/, move: 1, visemes: ["CH"] }], // ch
      ஞ்: [{ regex: /ஞ்/, move: 1, visemes: ["nn", "CH"] }], // nj
      ட்: [{ regex: /ட்/, move: 1, visemes: ["DD"] }], // t (retroflex)
      ண்: [{ regex: /ண்/, move: 1, visemes: ["nn"] }], // n (retroflex)
      த்: [{ regex: /த்/, move: 1, visemes: ["TH"] }], // th
      ந்: [{ regex: /ந்/, move: 1, visemes: ["nn"] }], // n
      ப்: [{ regex: /ப்/, move: 1, visemes: ["PP"] }], // p
      ம்: [{ regex: /ம்/, move: 1, visemes: ["PP"] }], // m
      ய்: [{ regex: /ய்/, move: 1, visemes: ["I"] }], // y
      ர்: [{ regex: /ர்/, move: 1, visemes: ["RR"] }], // r
      ல்: [{ regex: /ல்/, move: 1, visemes: ["nn"] }], // l
      வ்: [{ regex: /வ்/, move: 1, visemes: ["FF"] }], // v
      ழ்: [{ regex: /ழ்/, move: 1, visemes: ["nn"] }], // zh (unique Tamil sound)
      ள்: [{ regex: /ள்/, move: 1, visemes: ["nn"] }], // l (retroflex)
      ற்: [{ regex: /ற்/, move: 1, visemes: ["RR"] }], // r (hard)
      ன்: [{ regex: /ன்/, move: 1, visemes: ["nn"] }], // n (dental)
      ஜ்: [{ regex: /ஜ்/, move: 1, visemes: ["SS"] }], // j
      ஷ்: [{ regex: /ஷ்/, move: 1, visemes: ["SS"] }], // sh
      ஸ்: [{ regex: /ஸ்/, move: 1, visemes: ["SS"] }], // s
      ஹ்: [{ regex: /ஹ்/, move: 1, visemes: ["kk"] }], // h

      க: [{ regex: /க/, move: 1, visemes: ["kk", "aa"] }], // ka
      கா: [{ regex: /கா/, move: 1, visemes: ["kk", "aa"] }], // kaa
      கி: [{ regex: /கி/, move: 1, visemes: ["kk", "I"] }], // ki
      கீ: [{ regex: /கீ/, move: 1, visemes: ["kk", "I"] }], // kii
      கு: [{ regex: /கு/, move: 1, visemes: ["kk", "U"] }], // ku
      கூ: [{ regex: /கூ/, move: 1, visemes: ["kk", "U"] }], // kuu
      கெ: [{ regex: /கெ/, move: 1, visemes: ["kk", "E"] }], // ke
      கே: [{ regex: /கே/, move: 1, visemes: ["kk", "E"] }], // kee
      கை: [{ regex: /கை/, move: 1, visemes: ["kk", "aa", "I"] }], // kai
      கொ: [{ regex: /கொ/, move: 1, visemes: ["kk", "O"] }], // ko
      கோ: [{ regex: /கோ/, move: 1, visemes: ["kk", "O"] }], // koo
      கௌ: [{ regex: /கௌ/, move: 1, visemes: ["kk", "aa", "U"] }], // kau

      ப: [{ regex: /ப/, move: 1, visemes: ["PP", "aa"] }], // pa
      பா: [{ regex: /பா/, move: 1, visemes: ["PP", "aa"] }], // paa
      பி: [{ regex: /பி/, move: 1, visemes: ["PP", "I"] }], // pi
      பீ: [{ regex: /பீ/, move: 1, visemes: ["PP", "I"] }], // pii
      பு: [{ regex: /பு/, move: 1, visemes: ["PP", "U"] }], // pu
      பூ: [{ regex: /பூ/, move: 1, visemes: ["PP", "U"] }], // puu
      பெ: [{ regex: /பெ/, move: 1, visemes: ["PP", "E"] }], // pe
      பே: [{ regex: /பே/, move: 1, visemes: ["PP", "E"] }], // pee
      பை: [{ regex: /பை/, move: 1, visemes: ["PP", "aa", "I"] }], // pai
      பொ: [{ regex: /பொ/, move: 1, visemes: ["PP", "O"] }], // po
      போ: [{ regex: /போ/, move: 1, visemes: ["PP", "O"] }], // poo
      பௌ: [{ regex: /பௌ/, move: 1, visemes: ["PP", "aa", "U"] }], // pau

      த: [{ regex: /த/, move: 1, visemes: ["TH", "aa"] }], // tha
      தா: [{ regex: /தா/, move: 1, visemes: ["TH", "aa"] }], // thaa
      தி: [{ regex: /தி/, move: 1, visemes: ["TH", "I"] }], // thi
      தீ: [{ regex: /தீ/, move: 1, visemes: ["TH", "I"] }], // thii
      து: [{ regex: /து/, move: 1, visemes: ["TH", "U"] }], // thu
      தூ: [{ regex: /தூ/, move: 1, visemes: ["TH", "U"] }], // thuu
      தெ: [{ regex: /தெ/, move: 1, visemes: ["TH", "E"] }], // the
      தே: [{ regex: /தே/, move: 1, visemes: ["TH", "E"] }], // thee
      தை: [{ regex: /தை/, move: 1, visemes: ["TH", "aa", "I"] }], // thai
      தொ: [{ regex: /தொ/, move: 1, visemes: ["TH", "O"] }], // tho
      தோ: [{ regex: /தோ/, move: 1, visemes: ["TH", "O"] }], // thoo
      தௌ: [{ regex: /தௌ/, move: 1, visemes: ["TH", "aa", "U"] }], // thau
    };

    this.visemeDurations = {
      aa: 1.0,
      E: 0.9,
      I: 0.85,
      O: 0.95,
      U: 0.9,
      PP: 1.1,
      SS: 1.2,
      TH: 1.05,
      DD: 1.1,
      FF: 1.0,
      kk: 1.2,
      nn: 0.9,
      RR: 0.8,
      CH: 1.1,
      sil: 1,
    };

    this.specialDurations = {
      " ": 1,
      ",": 3,
      "-": 0.5,
      "'": 0.5,
      ".": 4,
      "?": 3.5,
      "!": 3.5,
    };

    // Tamil number words
    this.digits = [
      "பூஜ்யம்",
      "ஒன்று",
      "இரண்டு",
      "மூன்று",
      "நான்கு",
      "ஐந்து",
      "ஆறு",
      "ஏழு",
      "எட்டு",
      "ஒன்பது",
    ];
    this.tens = [
      "",
      "பத்து",
      "இருபது",
      "முப்பது",
      "நாற்பது",
      "ஐம்பது",
      "அறுபது",
      "எழுபது",
      "எண்பது",
      "தொண்ணூறு",
    ];
    this.hundreds = [
      "",
      "நூறு",
      "இருநூறு",
      "முந்நூறு",
      "நானூறு",
      "ஐநூறு",
      "அறுநூறு",
      "எழுநூறு",
      "எண்ணூறு",
      "தொள்ளாயிரம்",
    ];
    this.thousands = "ஆயிரம்";
    this.lakhs = "லட்சம்";
    this.crores = "கோடி";

    // Symbols to Tamil
    this.symbols = {
      "%": "சதவீதம்",
      "€": "யூரோ",
      "&": "மற்றும்",
      "+": "கூட்டல்",
      $: "டாலர்",
      "₹": "ரூபாய்",
    };
    this.symbolsReg = /[%€&\+\$₹]/g;
  }

  convertNumberToWords(num) {
    num = parseInt(num);

    if (num == 0) {
      return this.digits[0];
    }

    let words = "";

    // Handle crores (10 million)
    if (num >= 10000000) {
      words +=
        this.convertNumberToWords(Math.floor(num / 10000000)) +
        " " +
        this.crores +
        " ";
      num %= 10000000;
    }

    // Handle lakhs (100,000)
    if (num >= 100000) {
      words +=
        this.convertNumberToWords(Math.floor(num / 100000)) +
        " " +
        this.lakhs +
        " ";
      num %= 100000;
    }

    // Handle thousands
    if (num >= 1000) {
      words +=
        this.convertNumberToWords(Math.floor(num / 1000)) +
        " " +
        this.thousands +
        " ";
      num %= 1000;
    }

    // Handle hundreds
    if (num >= 100) {
      words += this.hundreds[Math.floor(num / 100)] + " ";
      num %= 100;
    }

    // Handle tens
    if (num >= 10 && num <= 19) {
      // Special case for 11-19 in Tamil
      words += this.digits[num % 10] + "பதின்" + " ";
    } else if (num >= 20) {
      words += this.tens[Math.floor(num / 10)] + " ";
      num %= 10;
    }

    // Handle ones
    if (num > 0) {
      words += this.digits[num] + " ";
    }

    return words.trim();
  }

  /**
   * Preprocess text:
   * - convert symbols to words
   * - convert numbers to words
   * - filter out characters that should be left unspoken
   * @param {string} s Text
   * @return {string} Pre-processsed text.
   */
  preProcessText(s) {
    return s
      .replace(/[#_*":;]/g, "")
      .replace(this.symbolsReg, (symbol) => {
        return " " + this.symbols[symbol] + " ";
      })
      .replace(/(\d)\.(\d)/g, "$1 point $2") // Number separator (point)
      .replace(/\d+/g, this.convertNumberToWords.bind(this)) // Numbers to words
      .replace(/(\D)\1\1+/g, "$1$1") // max 2 repeating chars
      .replaceAll("  ", " ") // Only one repeating space
      .trim();
  }

  /**
   * Convert word to Oculus LipSync Visemes and durations
   * @param {string} w Text
   * @return {Object} Oculus LipSync Visemes and durations.
   */
  wordsToVisemes(w) {
    let o = { words: w, visemes: [], times: [], durations: [], i: 0 };
    let t = 0;

    const chars = [...o.words];
    while (o.i < chars.length) {
      const c = chars[o.i];
      const ruleset = this.rules[c];

      if (ruleset) {
        for (let i = 0; i < ruleset.length; i++) {
          const rule = ruleset[i];
          const test =
            o.words.substring(0, o.i) + c + o.words.substring(o.i + 1);
          let matches = test.match(rule.regex);

          if (matches) {
            rule.visemes.forEach((viseme) => {
              if (
                o.visemes.length &&
                o.visemes[o.visemes.length - 1] === viseme
              ) {
                const d = 0.7 * (this.visemeDurations[viseme] || 1);
                o.durations[o.durations.length - 1] += d;
                t += d;
              } else {
                const d = this.visemeDurations[viseme] || 1;
                o.visemes.push(viseme);
                o.times.push(t);
                o.durations.push(d);
                t += d;
              }
            });
            o.i += rule.move;
            break;
          }
        }
      } else {
        o.i++;
        t += this.specialDurations[c] || 0;
      }
    }

    return o;
  }

  /**
   * Process text to generate visemes
   * @param {string} text Input Tamil text
   * @return {Object} Processed visemes and timing data
   */
  processText(text) {
    const preprocessed = this.preProcessText(text);
    const words = preprocessed.split(" ");

    let result = {
      originalText: text,
      preprocessedText: preprocessed,
      words: [],
      visemes: [],
      times: [],
      durations: [],
    };

    let totalTime = 0;

    // Process each word
    for (let i = 0; i < words.length; i++) {
      if (words[i].trim() === "") continue;

      const wordResult = this.wordsToVisemes(words[i]);

      // Add the word data
      result.words.push({
        text: words[i],
        startTime: totalTime,
        visemes: wordResult.visemes,
        times: wordResult.times.map((t) => t + totalTime),
        durations: wordResult.durations,
      });

      // Add word's visemes to the global result
      for (let j = 0; j < wordResult.visemes.length; j++) {
        result.visemes.push(wordResult.visemes[j]);
        result.times.push(wordResult.times[j] + totalTime);
        result.durations.push(wordResult.durations[j]);
      }

      // Calculate word duration
      const wordDuration =
        wordResult.times.length > 0
          ? wordResult.times[wordResult.times.length - 1] +
            wordResult.durations[wordResult.durations.length - 1]
          : 0;

      totalTime += wordDuration + this.specialDurations[" "]; // Add word spacing
    }

    return result;
  }
}

export { LipsyncEn, LipsyncTa };
