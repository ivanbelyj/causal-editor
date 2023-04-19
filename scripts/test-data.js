var testData1 = `[
    {
      "id": "0",
      "parentIds": ["8"],
      "value": "Hello world"
    },
    {
      "id": "1",
      "parentIds": []
    },
    {
      "id": "2",
      "parentIds": []
    },
    {
      "id": "3",
      "parentIds": ["11"]
    },
    {
      "id": "4",
      "parentIds": ["12"]
    },
    {
      "id": "5",
      "parentIds": ["18"]
    },
    {
      "id": "6",
      "parentIds": ["9", "15", "17"]
    },
    {
      "id": "7",
      "parentIds": ["3", "17", "20", "21"]
    },
    {
      "id": "8",
      "parentIds": []
    },
    {
      "id": "9",
      "parentIds": ["4"]
    },
    {
      "id": "10",
      "parentIds": ["16", "21"]
    },
    {
      "id": "11",
      "parentIds": ["2"]
    },
    {
      "id": "12",
      "parentIds": ["21"]
    },
    {
      "id": "13",
      "parentIds": ["4", "12"]
    },
    {
      "id": "14",
      "parentIds": ["1", "8"]
    },
    {
      "id": "15",
      "parentIds": []
    },
    {
      "id": "16",
      "parentIds": ["0"]
    },
    {
      "id": "17",
      "parentIds": ["19"]
    },
    {
      "id": "18",
      "parentIds": ["9"]
    },
    {
      "id": "19",
      "parentIds": []
    },
    {
      "id": "20",
      "parentIds": ["13"]
    },
    {
      "id": "21",
      "parentIds": []
    }
  ]`;

var characterFacts = `
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

var testData = characterFacts;
