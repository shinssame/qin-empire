/* =========================================================
   scenario.js
   -----------------------------------------------------------
   게임의 모든 "이야기 데이터"가 들어있는 파일입니다.
   배경: 기원전 221년, 천하를 통일한 진(秦)나라의 첫 번째 황제.
   세계사 수업(고대 중국 - 진의 통일과 몰락)에 맞춘 시나리오입니다.

   교사는 이 파일의 텍스트/이미지 경로/능력치 수치만 바꿔도
   전혀 다른 내용의 수업용 시나리오를 만들 수 있습니다.

   [씬(scene) 객체 형식]
   {
     id: "고유 식별자 (디버깅/저장용)",
     bg: "images/bg/파일명.svg",     // 배경 이미지 경로
     npc: "images/npc/파일명.svg",   // NPC 이미지 경로 (없으면 null)
     speaker: "말하는 사람 이름",     // 나레이션이면 null
     text: "대사 또는 지문 내용",
     choices: [                      // 선택지가 없으면 생략(다음 씬으로 자동 진행)
       {
         text: "버튼에 표시될 문구",
         effects: { 능력치이름: 증감값, ... },
         resultText: "선택 후 보여줄 결과 지문(선택 사항)"
       }
     ]
   }

   [능력치 키 이름]
   공개 능력치: wangkwon(황권), minsim(민심), gunsa(군사), jaejeong(재정)
   숨김 능력치: gwijok(귀족/구세력 불만), baekseong(백성 불만), yusaeng(유생 반발)
   ========================================================= */

// 능력치 초기값 (0~100 범위로 설계)
const INITIAL_STATS = {
  wangkwon: 55,
  minsim: 50,
  gunsa: 50,
  jaejeong: 50,
  gwijok: 35,
  baekseong: 25,
  yusaeng: 25,
};

const SCENARIO = {
/* ========================= 오프닝 ========================= */
opening: [
  {
    id: "op_1",
    bg: "images/bg/bg_opening.svg",
    npc: null,
    speaker: null,
    text: "기원전 221년, 진(秦)나라는 마침내 전국 시대의 혼란을 끝내고 여섯 나라를 모두 정복하였다. 수백 년 동안 이어진 전쟁이 끝나고 중국 역사상 최초의 통일 국가가 탄생하였다.",
  },
  {
    id: "op_2",
    bg: "images/bg/bg_throne.svg",
    npc: null,
    speaker: null,
    text: "진왕 정(政)은 이전의 왕들과 다른 새로운 지배자의 칭호가 필요하다고 생각하였다. 그는 삼황오제의 이름에서 따온 '황제(皇帝)'라는 칭호를 사용하고 스스로를 시황제(始皇帝)라 칭하였다.",
  },
  {
    id: "op_3",
    bg: "images/bg/bg_throne.svg",
    npc: "images/npc/npc_lisi.svg",
    speaker: "승상 이사(李斯)",
    text: "폐하, 전쟁으로 천하는 하나가 되었으나 사람들의 생활 방식과 생각까지 하나가 된 것은 아니옵니다. 옛 여섯 나라의 제도와 풍습은 여전히 남아 있사옵니다. 이제 새로운 제국을 어떤 방식으로 다스릴지 결정하셔야 하옵니다.",
  },
  {
    id: "op_4",
    bg: "images/bg/bg_throne.svg",
    npc: null,
    speaker: null,
    text: "당신은 진시황의 신하가 되어 통일 제국의 운영 방향을 결정하게 된다. 각 선택은 황권, 민심, 군사력, 재정 그리고 귀족과 백성들의 반응에 영향을 준다.",
  },
],

/* ========================= 제1장 ========================= */

chapter1: {
  title: "제1장 · 하나의 천하, 새로운 통치 방식",
  scenes: [

    {
      id: "c1_1",
      bg: "images/bg/bg_hall.svg",
      npc: "images/npc/npc_noble.svg",
      speaker: "옛 육국 귀족",
      text: "폐하, 오랜 세월 각 지역은 자신들의 왕과 전통을 가지고 살아왔습니다. 공신과 왕족에게 토지를 나누어 제후로 삼는다면 백성들도 익숙한 질서 속에서 안정될 것이옵니다.",
    },

    {
      id: "c1_2",
      bg: "images/bg/bg_hall.svg",
      npc: "images/npc/npc_lisi.svg",
      speaker: "승상 이사(李斯)",
      text: "폐하, 과거 주나라의 봉건제는 시간이 지나며 제후들이 강해져 천하가 다시 분열되는 원인이 되었습니다. 이제는 황제께서 직접 임명한 관리가 지방을 다스리는 군현제가 필요하옵니다.",
    },

    {
      id: "c1_3",
      bg: "images/bg/bg_throne.svg",
      npc: null,
      speaker: null,
      text: "통일 이후 첫 번째 결정. 제국을 안정시키기 위해 기존 질서를 활용할 것인가, 새로운 중앙 집권 체제를 만들 것인가.",
      choices: [

        {
          text: "옛 봉건제를 일부 유지하여 지역 세력과 협력한다",
          effects: {
            wangkwon: -8,
            gwijok: -15,
            minsim: 5,
            jaejeong: -3
          },
          resultText:
          "옛 귀족들은 자신들의 지위를 유지할 수 있다는 기대를 품는다. 그러나 중앙 정부의 힘이 약해질 가능성을 우려하는 목소리도 나온다.",
        },


        {
          text: "전국을 군현으로 나누고 황제가 관리하는 체제를 만든다",
          effects: {
            wangkwon: 12,
            gwijok: 15,
            gunsa: 5,
            jaejeong: 5
          },
          resultText:
          "황제가 직접 임명한 관리가 지방을 다스리는 중앙 집권 체제가 시작된다. 제국을 하나의 기준으로 운영하기 쉬워지지만 기존 귀족 세력의 불만은 커진다.",
        },


        {
          text: "지역 전통은 인정하되 중앙의 통제를 점차 강화한다",
          effects: {
            wangkwon: 5,
            minsim: 8,
            gwijok: -3,
            jaejeong: 2
          },
          resultText:
          "급격한 변화를 피하면서 지역의 반발을 줄일 수 있다. 그러나 통일된 국가 체제를 만드는 속도는 늦어질 수 있다.",
        }

      ],
    },


    {
      id: "c1_4",
      bg: "images/bg/bg_garden_night.svg",
      npc: "images/npc/npc_mengtian.svg",
      speaker: "장군 몽염(蒙恬)",
      text: "폐하, 통일 전쟁은 끝났지만 나라를 지키는 일은 계속되어야 합니다. 북쪽에는 흉노와 같은 세력이 존재하고 있으며, 새로운 제국의 국경을 안정시키는 일이 필요하옵니다.",
    },


    {
      id: "c1_5",
      bg: "images/bg/bg_throne.svg",
      npc: null,
      speaker: null,
      text: "첫 번째 결정이 내려졌다. 진 제국은 이전 시대와 다른 새로운 통치 체제를 향해 나아가기 시작한다. 그러나 거대한 제국을 유지하기 위해서는 더 많은 선택이 필요하다.",
    },

  ],
},
/* ========================= 제2장 ========================= */



chapter2: {

  title: "제2장 · 하나의 기준, 하나의 제국",

  scenes: [



    {

      id: "c2_1",

      bg: "images/bg/bg_study.svg",

      npc: "images/npc/npc_lisi.svg",

      speaker: "승상 이사(李斯)",

      text: "폐하, 통일 이전의 여섯 나라는 서로 다른 문자와 화폐, 도량형을 사용하였사옵니다. 같은 물건의 크기와 무게를 재는 기준조차 달랐으니 행정과 상업을 통일하기 어려웠사옵니다.",

    },



    {

      id: "c2_2",

      bg: "images/bg/bg_market.svg",

      npc: "images/npc/npc_merchant.svg",

      speaker: "상인",

      text: "폐하, 새로운 화폐와 도량형은 장사를 더욱 편리하게 만들 것입니다. 하지만 오랫동안 사용하던 기준을 바꾸는 과정에서 혼란도 생길 수 있사옵니다.",

    },
    {

      id: "c2_3",
      bg: "images/bg",
  npc: "images/npc/npc_merchant.svg",
  speaker: "상인",
      text: "폐하, 새로운 화폐와 도량형은 장사를 더욱 편리하게 만들 것입니다. 하지만 오랫동안 사용하던 기준을 바꾸는 과정에서 혼란도 생길 수 있사옵니다.",

    },
    {

      id: "c2_3",

      bg: "images/bg/bg_study.svg",

      npc: null,

      speaker: null,

      text: "제국을 하나로 묶기 위한 통일 정책. 빠르고 강력하게 시행할 것인가, 백성들이 적응할 시간을 줄 것인가.",

      choices: [



        {

          text: "새로운 문자와 화폐, 도량형을 즉시 전국에 시행한다",

          effects: {

            wangkwon: 8,

            jaejeong: 12,

            minsim: -5,

            baekseong: 8

          },

          resultText:

          "전국의 행정과 경제 활동이 하나의 기준 아래 정리된다. 황제의 명령은 빠르게 전달되지만 갑작스러운 변화에 적응하지 못하는 사람들의 불만도 생긴다.",

        },



        {

          text: "지역 상황을 고려하여 단계적으로 시행한다",

          effects: {

            wangkwon: 3,

            jaejeong: 5,

            minsim: 8,

            baekseong: -2

          },

          resultText:

          "변화 과정에서 발생하는 혼란은 줄어든다. 그러나 지역마다 정착 속도가 달라 제국 전체의 통일은 늦어질 수 있다.",

        },



        {

          text: "관리와 상인들의 의견을 먼저 듣고 기준을 조정한다",

          effects: {

            wangkwon: -3,

            jaejeong: 8,

            minsim: 10,

            gwijok: -2

          },

          resultText:

          "현장의 불편을 줄일 수 있지만 황제의 명령이 늦게 시행된다는 비판이 나올 수 있다.",

        }



      ],

    },





    {

      id: "c2_4",

      bg: "images/bg/bg_market.svg",

      npc: null,

      speaker: null,

      text: "진나라는 문자와 화폐, 도량형을 통일하며 이전 시대와 다른 하나의 국가 체제를 만들어 나간다. 작은 기준의 통일이 거대한 제국을 움직이는 기반이 되었다.",

    },



  ],

},





/* ========================= 제3장 ========================= */



chapter3: {

  title: "제3장 · 북방의 위협과 만리장성",

  scenes: [



    {

      id: "c3_1",

      bg: "images/bg/bg_border.svg",

      npc: "images/npc/npc_mengtian.svg",

      speaker: "장군 몽염(蒙恬)",

      text: "폐하, 북방의 흉노가 국경 지역에서 움직임을 보이고 있사옵니다. 과거 여러 나라가 쌓았던 성벽을 연결하고 보수한다면 북방 방어에 도움이 될 것이옵니다.",

    },



    {

      id: "c3_2",

      bg: "images/bg/bg_border.svg",

      npc: "images/npc/npc_farmer.svg",

      speaker: "백성 대표",

      text: "폐하, 나라를 지키는 일이 중요하다는 것은 알고 있사옵니다. 하지만 많은 장정들이 공사에 동원된다면 농사를 짓는 사람들의 삶이 어려워질 수 있사옵니다.",

    },



    {

      id: "c3_3",

      bg: "images/bg/bg_border.svg",

      npc: null,

      speaker: null,

      text: "북방을 지키기 위한 방법을 선택해야 한다. 강력한 군사 대응을 할 것인가, 다른 방법으로 부담을 줄일 것인가.",

      choices: [



        {

          text: "대규모 인력을 동원하여 성벽을 연결하고 국경 방어를 강화한다",

          effects: {

            gunsa: 18,

            wangkwon: 8,

            jaejeong: -10,

            baekseong: 15

          },

          resultText:

          "북방 방어 능력은 강화된다. 그러나 많은 백성이 공사에 동원되면서 노동 부담이 커지고 불만이 쌓인다.",

        },



        {

          text: "군사력을 유지하되 방어 시설 건설 규모를 줄인다",

          effects: {

            gunsa: 8,

            jaejeong: 5,

            baekseong: -5,

            minsim: 5

          },

          resultText:

          "백성의 부담은 줄어든다. 하지만 국경 방어에 필요한 준비가 부족해질 가능성이 있다.",

        },



        {

          text: "북방 세력과 교류를 확대하여 충돌을 줄인다",

          effects: {

            gunsa: -5,

            minsim: 8,

            jaejeong: 8,

            baekseong: -8

          },

          resultText:

          "전쟁과 대규모 동원의 가능성은 줄어든다. 그러나 일부 장수들은 국경 방어가 약해질 것을 걱정한다.",

        }



      ],

    },





    {

      id: "c3_4",

      bg: "images/bg/bg_throne.svg",

      npc: "images/npc/npc_lisi.svg",

      speaker: "승상 이사(李斯)",

      text: "폐하, 제국은 점점 안정되어 가고 있사옵니다. 하지만 최근에는 황제의 정책과 법을 비판하는 목소리도 나타나고 있사옵니다.",

    },





    {

      id: "c3_5",

      bg: "images/bg/bg_throne.svg",

      npc: null,

      speaker: null,

      text: "강력한 통일 정책은 제국의 힘을 키웠다. 그러나 국가의 힘이 커질수록 그 힘을 어떻게 사용할 것인지에 대한 고민도 깊어진다.",

    },



  ],

},
/* ========================= 제4장 ========================= */

chapter4: {
  title: "제4장 · 황제의 권위와 사상의 통제",
  scenes: [

    {
      id: "c4_1",
      bg: "images/bg/bg_hall.svg",
      npc: "images/npc/npc_scholar.svg",
      speaker: "유생",
      text: "폐하, 옛 성현들의 가르침에는 나라를 다스리는 지혜가 담겨 있사옵니다. 새로운 법만을 강조한다면 백성들이 올바른 도리를 잊을 수도 있사옵니다.",
    },

    {
      id: "c4_2",
      bg: "images/bg/bg_hall.svg",
      npc: "images/npc/npc_lisi.svg",
      speaker: "승상 이사(李斯)",
      text: "폐하, 옛 제도를 그리워하는 자들이 새로운 법령을 계속 비판하고 있사옵니다. 통일된 법을 유지하기 위해서는 황제의 명령을 흔드는 목소리를 제한할 필요가 있사옵니다.",
    },

    {
      id: "c4_3",
      bg: "images/bg/bg_study.svg",
      npc: null,
      speaker: null,
      text: "제국의 안정을 위해 비판을 제한할 것인가, 다양한 의견을 인정할 것인가. 통치자는 국가의 질서와 표현의 자유 사이에서 선택해야 한다.",
      choices: [

        {
          text: "비판을 강하게 제한하고 황제 중심의 질서를 유지한다",
          effects: {
            wangkwon: 15,
            yusaeng: 20,
            minsim: -10,
            gwijok: 5
          },
          resultText:
          "황제의 명령은 더욱 강력하게 시행된다. 하지만 자신의 생각을 표현하지 못하는 사람들 사이에서 불만이 커진다.",
        },

        {
          text: "비판을 허용하고 여러 의견을 검토한다",
          effects: {
            wangkwon: -5,
            minsim: 10,
            yusaeng: -5,
            gwijok: -3
          },
          resultText:
          "다양한 의견을 들을 수 있게 된다. 그러나 일부 관리들은 국가의 통제가 약해질 것을 걱정한다.",
        },

        {
          text: "국가 운영에 필요한 분야의 학문은 유지하고 정치적 비판은 제한한다",
          effects: {
            wangkwon: 8,
            yusaeng: 8,
            jaejeong: 3
          },
          resultText:
          "실용적인 지식은 활용하면서 정치적 반발을 줄이려 한다. 그러나 어디까지 제한할 것인지에 대한 논쟁은 계속된다.",
        }

      ],
    },


    {
      id: "c4_4",
      bg: "images/bg/bg_study.svg",
      npc: null,
      speaker: null,
      text: "실제 역사에서 진시황과 이사는 사상을 통제하기 위한 정책을 추진하였다. 이를 대표하는 사건이 분서갱유(焚書坑儒)이다. 다만 모든 책을 없앤 것이 아니라, 진의 통치에 비판적인 일부 사상을 제한하려 한 정책이었다.",
    },

  ],
},


/* ========================= 제5장 ========================= */

chapter5: {
  title: "제5장 · 거대한 제국의 마지막 선택",
  scenes: [

    {
      id: "c5_1",
      bg: "images/bg/bg_throne.svg",
      npc: "images/npc/npc_farmer.svg",
      speaker: "백성 대표",
      text: "폐하, 장성과 궁궐, 그리고 황제의 무덤을 만드는 공사에 많은 백성이 동원되고 있사옵니다. 나라의 위엄은 높아졌으나 백성들의 삶은 점점 어려워지고 있사옵니다.",
    },

    {
      id: "c5_2",
      bg: "images/bg/bg_hall.svg",
      npc: "images/npc/npc_lisi.svg",
      speaker: "승상 이사(李斯)",
      text: "폐하, 지금 중단한다면 그동안의 노력이 물거품이 될 것입니다. 위대한 제국에는 그에 걸맞은 건축물과 권위가 필요하옵니다.",
    },

    {
      id: "c5_3",
      bg: "images/bg/bg_hall.svg",
      npc: "images/npc/npc_mengtian.svg",
      speaker: "장군 몽염(蒙恬)",
      text: "폐하, 국가의 힘은 중요하옵니다. 그러나 백성의 힘이 약해진다면 강한 군대와 제도도 오래 유지되기 어려울 것이옵니다.",
    },

    {
      id: "c5_4",
      bg: "images/bg/bg_throne.svg",
      npc: null,
      speaker: null,
      text: "통일 이후 내려온 모든 선택이 지금의 제국을 만들었다. 제국의 위엄을 유지할 것인가, 백성의 부담을 줄일 것인가.",
      choices: [

        {
          text: "대규모 토목 사업을 계속 추진하여 황제의 권위를 보여준다",
          effects: {
            wangkwon: 10,
            jaejeong: -5,
            baekseong: 20,
            minsim: -15
          },
          resultText:
          "진 제국의 위엄을 보여주는 거대한 시설들이 만들어진다. 하지만 과도한 노동과 세금 부담으로 백성들의 불만은 커진다.",
        },

        {
          text: "토목 사업을 줄이고 백성의 부담을 완화한다",
          effects: {
            minsim: 15,
            baekseong: -15,
            wangkwon: -5,
            jaejeong: -5
          },
          resultText:
          "백성들의 삶은 안정될 수 있다. 그러나 황제의 권위를 보여주는 사업들은 축소된다.",
        },

        {
          text: "국가 운영에 필요한 사업만 유지하고 균형을 찾는다",
          effects: {
            wangkwon: 5,
            minsim: 5,
            jaejeong: 3,
            baekseong: 3
          },
          resultText:
          "제국의 힘과 백성의 부담 사이에서 균형을 찾으려 한다. 하지만 거대한 국가를 운영하는 어려움은 계속된다.",
        }

      ],
    },


    {
      id: "c5_5",
      bg: "images/bg/bg_ending_dawn.svg",
      npc: null,
      speaker: null,
      text: "기원전 210년, 진시황이 사망한다. 이후 후계자인 이세 황제와 조고의 통치 아래 진나라는 혼란에 빠지고, 결국 각지에서 반란이 일어나 통일 제국은 오래 유지되지 못한다.",
    },

  ],
},


/* ========================= 역사 비교 엔딩 ========================= */

ending: {

  title: "역사 속 진시황과 나의 선택",

  scenes: [

    {
      id: "end_1",
      bg: "images/bg/bg_library.svg",
      npc: null,
      speaker: "역사 해설",
      text:
      "실제 역사에서 진시황은 중국 최초의 통일 제국을 세우고 군현제를 실시하였다. 또한 문자·화폐·도량형을 통일하여 이후 중국 왕조의 기본 틀을 마련하였다.",
    },

    {
      id: "end_2",
      bg: "images/bg/bg_library.svg",
      npc: null,
      speaker: "역사 해설",
      text:
      "그러나 강력한 중앙 집권과 대규모 토목 사업, 엄격한 법 집행은 백성들에게 큰 부담이 되었다. 진나라는 통일 후 오래 지나지 않아 멸망하였다.",
    },

    {
      id: "end_3",
      bg: "images/bg/bg_library.svg",
      npc: null,
      speaker: "역사 해설",
      text:
      "진시황은 '위대한 통일자'이면서 동시에 '강압적인 통치자'라는 평가를 함께 받는다. 역사를 판단할 때는 한 가지 모습만 보는 것이 아니라 다양한 관점에서 살펴볼 필요가 있다.",
    },

    {
      id: "end_4",
      bg: "images/bg/bg_library.svg",
      npc: null,
      speaker: null,
      text:
      "생각해보기: 강한 국가는 무엇으로 만들어지는가? 국가 발전을 위해 개인의 희생은 어디까지 허용될 수 있는가?",
    },

  ],
}

};

console.log("scenario loaded", INITIAL_STATS);