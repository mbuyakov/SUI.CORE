const data = {
  "allDocTypes": {
    "singularName": "DocType",
    "fields": [
      "id",
      "docName",
      "docCode",
      "seriesRegex",
      "seriesRegexDesc",
      "numberRegex",
      "numberRegexDesc",
      "sorting"
    ],
    "data": [
      {
        "id": "1",
        "docName": "Паспорт гражданина СССР",
        "docCode": 1,
        "seriesRegex": "^([CС]{0,3}|[CС])([LЛ]?[XХ]{0,3}|[XХ][LCЛС])([VУ]?[I1]{0,3}|[I1][VXУХ])[-]{1}[А-Я]{2}$",
        "seriesRegexDesc": "R-ББ, где R - римские цифры или \"1\", \"У\", \"Х\", \"Л\", \"С\"; Б - любая русская заглавная буква",
        "numberRegex": "^[0-9]{6}$",
        "numberRegexDesc": "999999, где 9 - любая десятичная цифра (обязательная)",
        "sorting": 5
      },
      {
        "id": "2",
        "docName": "Загранпаспорт гражданина СССР",
        "docCode": 2,
        "seriesRegex": "^[0-9]{2}$",
        "seriesRegexDesc": "99, где 9 - любая десятичная цифра (обязательная)",
        "numberRegex": "^[0-9]{6,7}$",
        "numberRegexDesc": "0999999, где 0 - любая десятичная цифра (необязательная); 9 - любая десятичная цифра (обязательная)",
        "sorting": 6
      },
      {
        "id": "3",
        "docName": "Свидетельство о рождении",
        "docCode": 3,
        "seriesRegex": "^.{0,25}$",
        "seriesRegexDesc": "до 25 знаков",
        "numberRegex": "^.{0,25}$",
        "numberRegexDesc": "до 25 знаков",
        "sorting": 3
      },
      {
        "id": "4",
        "docName": "Удостоверение личности офицера",
        "docCode": 4,
        "seriesRegex": "^[А-Я]{2}$",
        "seriesRegexDesc": "ББ, где Б - любая русская заглавная буква",
        "numberRegex": "^[0-9]{6,7}$",
        "numberRegexDesc": "0999999, где 0 - любая десятичная цифра (необязательная); 9 - любая десятичная цифра (обязательная)",
        "sorting": 25
      },
      {
        "id": "5",
        "docName": "Справка об освобождении из мест лишения свободы",
        "docCode": 5,
        "seriesRegex": "^.{0,25}$",
        "seriesRegexDesc": "до 25 знаков",
        "numberRegex": "^.{0,25}$",
        "numberRegexDesc": "до 25 знаков",
        "sorting": 7
      },
      {
        "id": "6",
        "docName": "Паспорт Минморфлота",
        "docCode": 6,
        "seriesRegex": "^[А-Я]{2}$",
        "seriesRegexDesc": "ББ, где Б - любая русская заглавная буква",
        "numberRegex": "^[0-9]{6}$",
        "numberRegexDesc": "999999, где 9 - любая десятичная цифра (обязательная)",
        "sorting": 23
      },
      {
        "id": "7",
        "docName": "Военный билет",
        "docCode": 7,
        "seriesRegex": "^[А-Я]{2}$",
        "seriesRegexDesc": "ББ, где Б - любая русская заглавная буква",
        "numberRegex": "^[0-9]{6,7}$",
        "numberRegexDesc": "0999999, где 0 - любая десятичная цифра (необязательная); 9 - любая десятичная цифра (обязательная)",
        "sorting": 17
      },
      {
        "id": "8",
        "docName": "Временное удостоверение, выданное взамен военного билета",
        "docCode": 8,
        "seriesRegex": "^.{0,25}$",
        "seriesRegexDesc": "до 25 знаков",
        "numberRegex": "^.{0,25}$",
        "numberRegexDesc": "до 25 знаков",
        "sorting": 19
      },
      {
        "id": "9",
        "docName": "Дипломатический паспорт гражданина РФ",
        "docCode": 9,
        "seriesRegex": "^[0-9]{2}$",
        "seriesRegexDesc": "99, где 9 - любая десятичная цифра (обязательная)",
        "numberRegex": "^[0-9]{7}$",
        "numberRegexDesc": "9999999, где 9 - любая десятичная цифра (обязательная)",
        "sorting": 8
      },
      {
        "id": "10",
        "docName": "Паспорт иностранного гражданина",
        "docCode": 10,
        "seriesRegex": "^.{0,25}$",
        "seriesRegexDesc": "до 25 знаков",
        "numberRegex": "^.{0,25}$",
        "numberRegexDesc": "до 25 знаков",
        "sorting": 11
      },
      {
        "id": "11",
        "docName": "Свидетельство о рассмотрении ходатайства о признании лица беженцем на территории РФ по существу",
        "docCode": 11,
        "seriesRegex": "^.{0,25}$",
        "seriesRegexDesc": "до 25 знаков",
        "numberRegex": "^.{0,25}$",
        "numberRegexDesc": "до 25 знаков",
        "sorting": 14
      },
      {
        "id": "12",
        "docName": "Вид на жительство в РФ",
        "docCode": 12,
        "seriesRegex": "^.{0,25}$",
        "seriesRegexDesc": "до 25 знаков",
        "numberRegex": "^.{0,25}$",
        "numberRegexDesc": "до 25 знаков",
        "sorting": 10
      },
      {
        "id": "13",
        "docName": "Удостоверение беженца в РФ",
        "docCode": 13,
        "seriesRegex": "^.{0,25}$",
        "seriesRegexDesc": "до 25 знаков",
        "numberRegex": "^.{0,25}$",
        "numberRegexDesc": "до 25 знаков",
        "sorting": 16
      },
      {
        "id": "14",
        "docName": "Временное удостоверение личности гражданина РФ",
        "docCode": 14,
        "seriesRegex": "^.{0,25}$",
        "seriesRegexDesc": "до 25 знаков",
        "numberRegex": "^.{0,25}$",
        "numberRegexDesc": "до 25 знаков",
        "sorting": 4
      },
      {
        "id": "15",
        "docName": "Разрешение на временное проживание в РФ",
        "docCode": 15,
        "seriesRegex": "^.{0,25}$",
        "seriesRegexDesc": "до 25 знаков",
        "numberRegex": "^.{0,25}$",
        "numberRegexDesc": "до 25 знаков",
        "sorting": 12
      },
      {
        "id": "16",
        "docName": "Свидетельство о предоставлении временного убежища на территории РФ",
        "docCode": 18,
        "seriesRegex": "^[0-9]{0,2}$",
        "seriesRegexDesc": "00, где 0 - любая десятичная цифра (необязательная)",
        "numberRegex": "^[0-9]{0,7}$",
        "numberRegexDesc": "0000000, где 0 - любая десятичная цифра (необязательная)",
        "sorting": 13
      },
      {
        "id": "17",
        "docName": "Паспорт гражданина РФ",
        "docCode": 21,
        "seriesRegex": "^[0-9]{4}$",
        "seriesRegexDesc": "9999, где 9 - любая десятичная цифра (обязательная)",
        "numberRegex": "^[0-9]{6}$",
        "numberRegexDesc": "999999, где 9 - любая десятичная цифра (обязательная)",
        "sorting": 1
      },
      {
        "id": "18",
        "docName": "Заграничный паспорт РФ",
        "docCode": 22,
        "seriesRegex": "^[0-9]{2}$",
        "seriesRegexDesc": "99, где 9 - любая десятичная цифра (обязательная)",
        "numberRegex": "^[0-9]{7}$",
        "numberRegexDesc": "9999999, где 9 - любая десятичная цифра (обязательная)",
        "sorting": 2
      },
      {
        "id": "19",
        "docName": "Свидетельство о рождении, выданное уполномоченным органом иностранного государства",
        "docCode": 23,
        "seriesRegex": "^.{0,25}$",
        "seriesRegexDesc": "до 25 знаков",
        "numberRegex": "^.{0,25}$",
        "numberRegexDesc": "до 25 знаков",
        "sorting": 15
      },
      {
        "id": "20",
        "docName": "Удостоверение личности военнослужащего РФ",
        "docCode": 24,
        "seriesRegex": "^[А-Я]{2}$",
        "seriesRegexDesc": "ББ, где Б - любая русская заглавная буква",
        "numberRegex": "^[0-9]{7}$",
        "numberRegexDesc": "9999999, где  9 - любая десятичная цифра (обязательная)",
        "sorting": 20
      },
      {
        "id": "21",
        "docName": "Паспорт моряка",
        "docCode": 26,
        "seriesRegex": "^[А-Я]{2}$",
        "seriesRegexDesc": "ББ, где Б - любая русская заглавная буква",
        "numberRegex": "^[0-9]{6,7}$",
        "numberRegexDesc": "0999999, где 0 - любая десятичная цифра (необязательная); 9 - любая десятичная цифра (обязательная)",
        "sorting": 24
      },
      {
        "id": "22",
        "docName": "Военный билет офицера запаса",
        "docCode": 27,
        "seriesRegex": "^[А-Я]{2}$",
        "seriesRegexDesc": "ББ, где Б - любая русская заглавная буква",
        "numberRegex": "^[0-9]{6,7}$",
        "numberRegexDesc": "0999999, где 0 - любая десятичная цифра (необязательная); 9 - любая десятичная цифра (обязательная)",
        "sorting": 18
      },
      {
        "id": "23",
        "docName": "Иные документы",
        "docCode": 91,
        "seriesRegex": "^.{0,25}$",
        "seriesRegexDesc": "до 25 знаков",
        "numberRegex": "^.{0,25}$",
        "numberRegexDesc": "до 25 знаков",
        "sorting": 22
      },
      {
        "id": "25",
        "docName": "Служебный паспорт гражданина РФ",
        "docCode": null,
        "seriesRegex": "^.{0,25}$",
        "seriesRegexDesc": "до 25 знаков",
        "numberRegex": "^.{0,25}$",
        "numberRegexDesc": "до 25 знаков",
        "sorting": 9
      },
      {
        "id": "26",
        "docName": "Удостоверение личности моряка",
        "docCode": null,
        "seriesRegex": "^.{0,25}$",
        "seriesRegexDesc": "до 25 знаков",
        "numberRegex": "^.{0,25}$",
        "numberRegexDesc": "до 25 знаков",
        "sorting": 21
      }
    ]
  }
};

export interface IallDocTypes {
  id: string
  docName: string
  docCode: number
  seriesRegex: string
  seriesRegexDesc: string
  numberRegex: string
  numberRegexDesc: string
  sorting: number
}


export class DulService {
  public static allDocTypes(): IallDocTypes[] {
    return data.allDocTypes.data;
  }
}
