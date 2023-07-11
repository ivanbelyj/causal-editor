const characterFacts = `
[
  {
    "Id": "b60c45c1-10f3-42ee-a168-7a8756501d38",
    "ProbabilityNest": {
      "CausesExpression": {
        "$type": "factor",
        "Edge": {
          "Probability": 0.9
        }
      }
    },
    "NodeValue": "Хобби"
  },
  {
    "Id": "5702667c-6d01-4708-82b7-2ae05f2bbb99",
    "ProbabilityNest": {
      "CausesExpression": {
        "$type": "factor",
        "Edge": {
          "Probability": 0.3,
          "CauseId": "b60c45c1-10f3-42ee-a168-7a8756501d38"
        }
      }
    },
    "NodeValue": "Рисование"
  },
  {
    "Id": "d4faef45-f31b-4549-9bab-1391f6c7b683",
    "ProbabilityNest": {
      "CausesExpression": {
        "$type": "factor",
        "Edge": {
          "Probability": 0.3,
          "CauseId": "b60c45c1-10f3-42ee-a168-7a8756501d38"
        }
      }
    },
    "NodeValue": "Гитара"
  },
  {
    "Id": "9f00d386-11bc-4e08-ba36-d6c0b0bfc5a7",
    "ProbabilityNest": {
      "CausesExpression": {
        "$type": "factor",
        "Edge": {
          "Probability": 0.3,
          "CauseId": "b60c45c1-10f3-42ee-a168-7a8756501d38"
        }
      }
    },
    "NodeValue": "Программирование"
  },
  {
    "Id": "39aaf38c-8c15-4eca-84ff-97fa607367e6",
    "ProbabilityNest": {
      "CausesExpression": {
        "$type": "factor",
        "Edge": {
          "Probability": 0.3,
          "CauseId": "b60c45c1-10f3-42ee-a168-7a8756501d38"
        }
      }
    },
    "NodeValue": "Gamedev"
  },
  {
    "Id": "171367f7-c960-4b75-9a80-5726b90b8690",
    "ProbabilityNest": {
      "CausesExpression": {
        "$type": "factor",
        "Edge": {
          "Probability": 0.3,
          "CauseId": "b60c45c1-10f3-42ee-a168-7a8756501d38"
        }
      }
    },
    "NodeValue": "Писательство"
  },
  {
    "Id": "29cbd092-60db-4814-907d-818fdf1f13d0",
    "ProbabilityNest": {
      "CausesExpression": {
        "$type": "factor",
        "Edge": {
          "Probability": 0.3,
          "CauseId": "b60c45c1-10f3-42ee-a168-7a8756501d38"
        }
      }
    },
    "NodeValue": "Спорт"
  },
  {
    "Id": "739ea5c8-a5f9-4946-b31b-78ce2265dc41",
    "ProbabilityNest": {
      "CausesExpression": {
        "$type": "factor",
        "Edge": {
          "Probability": 0.3,
          "CauseId": "b60c45c1-10f3-42ee-a168-7a8756501d38"
        }
      }
    },
    "NodeValue": "Role play"
  },
  {
    "Id": "a74df5a2-d2e4-4ec9-bceb-2151f6208427",
    "ProbabilityNest": {
      "CausesExpression": {
        "$type": "factor",
        "Edge": {
          "Probability": 0.3,
          "CauseId": "b60c45c1-10f3-42ee-a168-7a8756501d38"
        }
      }
    },
    "NodeValue": "3d моделирование"
  },
  {
    "Id": "288411bf-232e-41de-8bcd-51f42b0ca4f4",
    "ProbabilityNest": {
      "CausesExpression": {
        "$type": "factor",
        "Edge": {
          "Probability": 0.1,
          "CauseId": "b60c45c1-10f3-42ee-a168-7a8756501d38"
        }
      }
    },
    "NodeValue": "Worldbuilding"
  },
  {
    "Id": "a6d1b1ed-016e-4d6d-b06f-1e2583f47662",
    "ProbabilityNest": {
      "CausesExpression": {
        "$type": "factor",
        "Edge": {
          "Probability": 1.0
        }
      }
    },
    "NodeValue": "Образование"
  },
  {
    "$type": "variant",
    "WeightNest": {
      "Weights": [
        {
          "Weight": 1.0,
          "CauseId": "a6d1b1ed-016e-4d6d-b06f-1e2583f47662"
        }
      ]
    },
    "AbstractFactId": "a6d1b1ed-016e-4d6d-b06f-1e2583f47662",
    "Id": "70c30cbe-8e2f-4840-8c79-38fcc1ae1697",
    "ProbabilityNest": {
      "CausesExpression": {
        "$type": "factor",
        "Edge": {
          "Probability": 1.0
        }
      }
    },
    "NodeValue": "Компьютерные науки"
  },
  {
    "$type": "variant",
    "WeightNest": {
      "Weights": [
        {
          "Weight": 1.0,
          "CauseId": "a6d1b1ed-016e-4d6d-b06f-1e2583f47662"
        }
      ]
    },
    "AbstractFactId": "a6d1b1ed-016e-4d6d-b06f-1e2583f47662",
    "Id": "ec2c821e-d635-4566-86df-e31fd3ed084f",
    "ProbabilityNest": {
      "CausesExpression": {
        "$type": "factor",
        "Edge": {
          "Probability": 1.0
        }
      }
    },
    "NodeValue": "История"
  },
  {
    "$type": "variant",
    "WeightNest": {
      "Weights": [
        {
          "Weight": 1.0,
          "CauseId": "a6d1b1ed-016e-4d6d-b06f-1e2583f47662"
        }
      ]
    },
    "AbstractFactId": "a6d1b1ed-016e-4d6d-b06f-1e2583f47662",
    "Id": "230a5cd7-2e5c-45fb-bcac-70cae6c8f993",
    "ProbabilityNest": {
      "CausesExpression": {
        "$type": "factor",
        "Edge": {
          "Probability": 1.0
        }
      }
    },
    "NodeValue": "Математика"
  },
  {
    "$type": "variant",
    "WeightNest": {
      "Weights": [
        {
          "Weight": 20.0,
          "CauseId": "a6d1b1ed-016e-4d6d-b06f-1e2583f47662"
        }
      ]
    },
    "AbstractFactId": "a6d1b1ed-016e-4d6d-b06f-1e2583f47662",
    "Id": "e2a1f472-8e25-4203-8472-cf4e49d019ee",
    "ProbabilityNest": {
      "CausesExpression": {
        "$type": "factor",
        "Edge": {
          "Probability": 1.0
        }
      }
    },
    "NodeValue": "лингвистика"
  },
  {
    "Id": "0365f580-5287-4882-b9f4-8d9d3b6da819",
    "ProbabilityNest": {
      "CausesExpression": {
        "$type": "factor",
        "Edge": {
          "Probability": 0.1,
          "CauseId": "b60c45c1-10f3-42ee-a168-7a8756501d38"
        }
      }
    },
    "NodeValue": "Создание языков"
  },
  {
    "Id": "3511f280-4458-4b85-9836-a90b8343ffee",
    "ProbabilityNest": {
      "CausesExpression": {
        "$type": "or",
        "Operands": [
          {
            "$type": "factor",
            "Edge": {
              "Probability": 0.9,
              "CauseId": "e2a1f472-8e25-4203-8472-cf4e49d019ee"
            }
          },
          {
            "$type": "factor",
            "Edge": {
              "Probability": 0.3,
              "CauseId": "0365f580-5287-4882-b9f4-8d9d3b6da819"
            }
          }
        ]
      }
    },
    "NodeValue": "Понимает несколько языков"
  },
  {
    "Id": "f7a9ffec-ba64-4ddd-b43c-6074e61ccb1e",
    "ProbabilityNest": {
      "CausesExpression": {
        "$type": "or",
        "Operands": [
          {
            "$type": "factor",
            "Edge": {
              "Probability": 0.95,
              "CauseId": "e2a1f472-8e25-4203-8472-cf4e49d019ee"
            }
          },
          {
            "$type": "factor",
            "Edge": {
              "Probability": 0.2,
              "CauseId": "0365f580-5287-4882-b9f4-8d9d3b6da819"
            }
          }
        ]
      }
    },
    "NodeValue": "Разбирается в лингвистике"
  },
  {
    "Id": "fa41650e-8d54-463d-a4c4-7e0829e834c6",
    "ProbabilityNest": {
      "CausesExpression": {
        "$type": "factor",
        "Edge": {
          "Probability": 1.0
        }
      }
    },
    "NodeValue": "Раса"
  },
  {
    "$type": "variant",
    "WeightNest": {
      "Weights": [
        {
          "Weight": 1.0,
          "CauseId": "fa41650e-8d54-463d-a4c4-7e0829e834c6"
        }
      ]
    },
    "AbstractFactId": "fa41650e-8d54-463d-a4c4-7e0829e834c6",
    "Id": "2a11a1e2-b50b-40ee-9880-d6ccc9425633",
    "ProbabilityNest": {
      "CausesExpression": {
        "$type": "factor",
        "Edge": {
          "Probability": 1.0
        }
      }
    },
    "NodeValue": "тшэайская"
  },
  {
    "$type": "variant",
    "WeightNest": {
      "Weights": [
        {
          "Weight": 1.0,
          "CauseId": "fa41650e-8d54-463d-a4c4-7e0829e834c6"
        }
      ]
    },
    "AbstractFactId": "fa41650e-8d54-463d-a4c4-7e0829e834c6",
    "Id": "37d3bb87-f61e-4ddc-b736-ff0f4bd3dbcd",
    "ProbabilityNest": {
      "CausesExpression": {
        "$type": "factor",
        "Edge": {
          "Probability": 1.0
        }
      }
    },
    "NodeValue": "мэрайская"
  },
  {
    "$type": "variant",
    "WeightNest": {
      "Weights": [
        {
          "Weight": 1.0,
          "CauseId": "fa41650e-8d54-463d-a4c4-7e0829e834c6"
        }
      ]
    },
    "AbstractFactId": "fa41650e-8d54-463d-a4c4-7e0829e834c6",
    "Id": "b7925f2b-962a-4537-8a47-da67e484c442",
    "ProbabilityNest": {
      "CausesExpression": {
        "$type": "factor",
        "Edge": {
          "Probability": 1.0
        }
      }
    },
    "NodeValue": "мйеурийская"
  },
  {
    "$type": "variant",
    "WeightNest": {
      "Weights": [
        {
          "Weight": 1.0,
          "CauseId": "fa41650e-8d54-463d-a4c4-7e0829e834c6"
        }
      ]
    },
    "AbstractFactId": "fa41650e-8d54-463d-a4c4-7e0829e834c6",
    "Id": "29b4ea2a-6b0d-495d-b9e9-d18265d5ad1b",
    "ProbabilityNest": {
      "CausesExpression": {
        "$type": "factor",
        "Edge": {
          "Probability": 1.0
        }
      }
    },
    "NodeValue": "эвойская"
  },
  {
    "$type": "variant",
    "WeightNest": {
      "Weights": [
        {
          "Weight": 1.0,
          "CauseId": "fa41650e-8d54-463d-a4c4-7e0829e834c6"
        }
      ]
    },
    "AbstractFactId": "fa41650e-8d54-463d-a4c4-7e0829e834c6",
    "Id": "d87ff013-2367-4827-91ea-5b9c767b6dc5",
    "ProbabilityNest": {
      "CausesExpression": {
        "$type": "factor",
        "Edge": {
          "Probability": 1.0
        }
      }
    },
    "NodeValue": "оанэйская"
  }
]
`;
const jailpunk = `
[
  {
    "Id": "34F0541A-80C0-4898-AB53-38C8D5463BFA",
    "ProbabilityNest": {
      "CausesExpression": {
        "$type": "factor",
        "Edge": {
          "Probability": 1
        }
      }
    },
    "NodeValue": "Public morality"
  },
  {
    "$type": "variant",
    "WeightNest": {
      "Weights": [
        {
          "Weight": 80.0,
          "CauseId": "34F0541A-80C0-4898-AB53-38C8D5463BFA"
        }
      ]
    },
    "AbstractFactId": "34F0541A-80C0-4898-AB53-38C8D5463BFA",
    "Id": "E894BFF6-AB69-4518-B04D-84C89E111566",
    "ProbabilityNest": {
      "CausesExpression": {
        "$type": "factor",
        "Edge": {
          "Probability": 1.0
        }
      }
    },
    "NodeValue": "Usual morality"
  },
  {
    "$type": "variant",
    "WeightNest": {
      "Weights": [
        {
          "Weight": 20.0,
          "CauseId": "34F0541A-80C0-4898-AB53-38C8D5463BFA"
        }
      ]
    },
    "AbstractFactId": "34F0541A-80C0-4898-AB53-38C8D5463BFA",
    "Id": "005DC3D9-A7F9-45DA-8299-B1AE2E81BDD1",
    "ProbabilityNest": {
      "CausesExpression": {
        "$type": "factor",
        "Edge": {
          "Probability": 1.0
        }
      }
    },
    "NodeValue": "Degrading morality"
  },
  {
    "Id": "A0DA3F66-A623-45DC-A65B-81D746230703",
    "ProbabilityNest": {
      "CausesExpression": {
        "$type": "factor",
        "Edge": {
          "Probability": 1
        }
      }
    },
    "NodeValue": "Initial authorities power"
  },

  {
    "$type": "variant",
    "WeightNest": {
      "Weights": [
        {
          "Weight": 1.0,
          "CauseId": "A0DA3F66-A623-45DC-A65B-81D746230703"
        }
      ]
    },
    "AbstractFactId": "A0DA3F66-A623-45DC-A65B-81D746230703",
    "Id": "938C0138-9841-4A38-A699-6882CF6B05C1",
    "ProbabilityNest": {
      "CausesExpression": {
        "$type": "factor",
        "Edge": {
          "Probability": 1.0
        }
      }
    },
    "NodeValue": "Weak initial authorities"
  },
  {
    "$type": "variant",
    "WeightNest": {
      "Weights": [
        {
          "Weight": 1.0,
          "CauseId": "A0DA3F66-A623-45DC-A65B-81D746230703"
        }
      ]
    },
    "AbstractFactId": "A0DA3F66-A623-45DC-A65B-81D746230703",
    "Id": "129E69CF-4217-4965-AD5B-BE2F6486744C",
    "ProbabilityNest": {
      "CausesExpression": {
        "$type": "factor",
        "Edge": {
          "Probability": 1.0
        }
      }
    },
    "NodeValue": "Normal initial authorities"
  },
  {
    "Id": "57FB8E4C-453F-48B4-BE43-27C6B32E78D0",
    "ProbabilityNest": {
      "CausesExpression": {
        "$type": "factor",
        "Edge": {
          "Probability": 1
        }
      }
    },
    "NodeValue": "Technologies level"
  },
  {
    "$type": "variant",
    "WeightNest": {
      "Weights": [
        {
          "Weight": 70.0,
          "CauseId": "57FB8E4C-453F-48B4-BE43-27C6B32E78D0"
        }
      ]
    },
    "AbstractFactId": "57FB8E4C-453F-48B4-BE43-27C6B32E78D0",
    "Id": "2E5340A8-7658-45B9-9C6A-EC28A018C230",
    "ProbabilityNest": {
      "CausesExpression": {
        "$type": "factor",
        "Edge": {
          "Probability": 1.0
        }
      }
    },
    "NodeValue": "Modern"
  },
  {
    "$type": "variant",
    "WeightNest": {
      "Weights": [
        {
          "Weight": 30.0,
          "CauseId": "57FB8E4C-453F-48B4-BE43-27C6B32E78D0"
        }
      ]
    },
    "AbstractFactId": "57FB8E4C-453F-48B4-BE43-27C6B32E78D0",
    "Id": "CB3A0E9E-8DDE-436A-9540-3E91F34CAF6D",
    "ProbabilityNest": {
      "CausesExpression": {
        "$type": "factor",
        "Edge": {
          "Probability": 1.0
        }
      }
    },
    "NodeValue": "Advanced"
  },

  {
    "Id": "40D25006-3627-4812-98F2-BBD03FDE9742",
    "ProbabilityNest": {
      "CausesExpression": {
        "$type": "or",
        "Operands": [
          {
            "$type": "factor",
            "Edge": {
              "Probability": 0.08
            }
          },
          {
            "$type": "factor",
            "Edge": {
              "Probability": 0.1,
              "CauseId": "CB3A0E9E-8DDE-436A-9540-3E91F34CAF6D"
            }
          }
        ]
      }
    },
    "NodeValue": "Another planet"
  },
  {
    "$type": "variant",
    "WeightNest": {
      "Weights": [
        {
          "Weight": 70.0,
          "CauseId": "40D25006-3627-4812-98F2-BBD03FDE9742"
        }
      ]
    },
    "AbstractFactId": "40D25006-3627-4812-98F2-BBD03FDE9742",
    "Id": "8DA339B4-2B76-4946-BF94-A94A2E3C5080",
    "ProbabilityNest": {
      "CausesExpression": {
        "$type": "factor",
        "Edge": {
          "Probability": 1.0
        }
      }
    },
    "NodeValue": "Colony"
  },
  {
    "$type": "variant",
    "WeightNest": {
      "Weights": [
        {
          "Weight": 30.0,
          "CauseId": "40D25006-3627-4812-98F2-BBD03FDE9742"
        }
      ]
    },
    "AbstractFactId": "40D25006-3627-4812-98F2-BBD03FDE9742",
    "Id": "0CB104CB-67D7-480A-8FA8-559987A1A48B",
    "ProbabilityNest": {
      "CausesExpression": {
        "$type": "factor",
        "Edge": {
          "Probability": 1.0
        }
      }
    },
    "NodeValue": "Conquerors"
  },
  {
    "Id": "62560E8F-FDC8-4F15-8EF2-5CE6BADCB7BE",
    "ProbabilityNest": {
      "CausesExpression": {
        "$type": "factor",
        "Edge": {
          "Probability": 0.4
        }
      }
    },
    "NodeValue": "War"
  },
  
  {
    "Id": "B34B63EF-020B-4155-8604-3F71F4096EAF",
    "ProbabilityNest": {
      "CausesExpression": {
        "$type": "factor",
        "Edge": {
          "Probability": 0.5,
          "CauseId": "62560E8F-FDC8-4F15-8EF2-5CE6BADCB7BE"
        }
      }
    },
    "NodeValue": "Nuclear war"
  },
  {
    "Id": "F3DC5993-C431-4C97-9A7C-1EBED7FFF18C",
    "ProbabilityNest": {
      "CausesExpression": {
        "$type": "and",
        "Operands": [
          {
            "$type": "factor",
            "Edge": {
              "Probability": 1,
              "CauseId": "62560E8F-FDC8-4F15-8EF2-5CE6BADCB7BE"
            }
          },
          {
            "$type": "or",
            "Operands": [
              {
                "$type": "factor",
                "Edge": {
                  "Probability": 0.2,
                  "CauseId": "62560E8F-FDC8-4F15-8EF2-5CE6BADCB7BE"
                }
              },
              {
                "$type": "factor",
                "Edge": {
                  "Probability": 0.1,
                  "CauseId": "CB3A0E9E-8DDE-436A-9540-3E91F34CAF6D"
                }
              }
            ]
          }
        ]
      }
    },
    "NodeValue": "Biological war"
  },
  {
    "Id": "B0BCFD0F-CE54-4B66-A89B-A27D658C0656",
    "ProbabilityNest": {
      "CausesExpression": {
        "$type": "factor",
        "Edge": {
          "Probability": 1
        }
      }
    },
    "NodeValue": "Creators main goal"
  },
  {
    "$type": "variant",
    "WeightNest": {
      "Weights": [
        {
          "Weight": 4,
          "CauseId": "B0BCFD0F-CE54-4B66-A89B-A27D658C0656"
        }
      ]
    },
    "AbstractFactId": "B0BCFD0F-CE54-4B66-A89B-A27D658C0656",
    "Id": "AF0B73F2-AA85-4CFD-80ED-E655A1FADAC9",
    "ProbabilityNest": {
      "CausesExpression": {
        "$type": "factor",
        "Edge": {
          "Probability": 1.0
        }
      }
    },
    "NodeValue": "Revenge"
  },
  {
    "$type": "variant",
    "WeightNest": {
      "Weights": [
        {
          "Weight": 4,
          "CauseId": "B0BCFD0F-CE54-4B66-A89B-A27D658C0656"
        }
      ]
    },
    "AbstractFactId": "B0BCFD0F-CE54-4B66-A89B-A27D658C0656",
    "Id": "B57FDB4C-7F53-42CB-A438-05C83C066E79",
    "ProbabilityNest": {
      "CausesExpression": {
        "$type": "factor",
        "Edge": {
          "Probability": 1
        }
      }
    },
    "NodeValue": "Violent experiment"
  },
  {
    "$type": "variant",
    "WeightNest": {
      "Weights": [
        {
          "Weight": 1.0,
          "CauseId": "B0BCFD0F-CE54-4B66-A89B-A27D658C0656"
        }
      ]
    },
    "AbstractFactId": "B0BCFD0F-CE54-4B66-A89B-A27D658C0656",
    "Id": "3F04D3B6-B354-4018-9E91-4A9A80B4498A",
    "ProbabilityNest": {
      "CausesExpression": {
        "$type": "factor",
        "Edge": {
          "Probability": 1.0
        }
      }
    },
    "NodeValue": "Reality show"
  },
  {
    "$type": "variant",
    "WeightNest": {
      "Weights": [
        {
          "Weight": 1.0,
          "CauseId": "B0BCFD0F-CE54-4B66-A89B-A27D658C0656"
        }
      ]
    },
    "AbstractFactId": "B0BCFD0F-CE54-4B66-A89B-A27D658C0656",
    "Id": "60362883-FAA4-4702-AFAD-18E771610C80",
    "ProbabilityNest": {
      "CausesExpression": {
        "$type": "factor",
        "Edge": {
          "Probability": 1.0
        }
      }
    },
    "NodeValue": "Entertainment"
  },
  {
    "$type": "variant",
    "WeightNest": {
      "Weights": [
        {
          "Weight": 1.0,
          "CauseId": "B0BCFD0F-CE54-4B66-A89B-A27D658C0656"
        }
      ]
    },
    "AbstractFactId": "B0BCFD0F-CE54-4B66-A89B-A27D658C0656",
    "Id": "6F423047-9811-4145-AD20-FE98A16DAA08",
    "ProbabilityNest": {
      "CausesExpression": {
        "$type": "factor",
        "Edge": {
          "Probability": 1.0
        }
      }
    },
    "NodeValue": "Extreme rest"
  },
  {
    "$type": "variant",
    "WeightNest": {
      "Weights": [
        {
          "Weight": 1.0,
          "CauseId": "B0BCFD0F-CE54-4B66-A89B-A27D658C0656"
        }
      ]
    },
    "AbstractFactId": "B0BCFD0F-CE54-4B66-A89B-A27D658C0656",
    "Id": "416E2A0D-A62E-4FE5-BE1F-0A7131F49D25",
    "ProbabilityNest": {
      "CausesExpression": {
        "$type": "factor",
        "Edge": {
          "Probability": 1.0
        }
      }
    },
    "NodeValue": "Simulation"
  },
  {
    "$type": "variant",
    "WeightNest": {
      "Weights": [
        {
          "Weight": 1.0,
          "CauseId": "B0BCFD0F-CE54-4B66-A89B-A27D658C0656"
        }
      ]
    },
    "AbstractFactId": "B0BCFD0F-CE54-4B66-A89B-A27D658C0656",
    "Id": "22E8BB04-C674-4841-BFB1-A981BA8EC8EA",
    "ProbabilityNest": {
      "CausesExpression": {
        "$type": "factor",
        "Edge": {
          "Probability": 1.0
        }
      }
    },
    "NodeValue": "Secret prison"
  },
  {
    "$type": "variant",
    "WeightNest": {
      "Weights": [
        {
          "Weight": 1.0,
          "CauseId": "B0BCFD0F-CE54-4B66-A89B-A27D658C0656"
        }
      ]
    },
    "AbstractFactId": "B0BCFD0F-CE54-4B66-A89B-A27D658C0656",
    "Id": "2B147682-5245-425A-A9F2-719A64B55959",
    "ProbabilityNest": {
      "CausesExpression": {
        "$type": "factor",
        "Edge": {
          "Probability": 1.0
        }
      }
    },
    "NodeValue": "Special training"
  }
]
`;
var testData = characterFacts;
export const factsCollection = jailpunk;
