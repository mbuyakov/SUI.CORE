package ru.sui.suientity.enums;

import java.util.HashMap;
import java.util.Map;

public enum DulType {
  ID1(1, "Паспорт гражданина СССР", 1, "^([CС]{0,3}|[CС])([LЛ]?[XХ]{0,3}|[XХ][LCЛС])([VУ]?[I1]{0,3}|[I1][VXУХ])[-]{1}[А-Я]{2}$", "R-ББ, где R - римские цифры или \"1\", \"У\", \"Х\", \"Л\", \"С\"; Б - любая русская заглавная буква", "^[0-9]{6}$", "999999, где 9 - любая десятичная цифра (обязательная)", 5),
  ID2(2, "Загранпаспорт гражданина СССР", 2, "^[0-9]{2}$", "99, где 9 - любая десятичная цифра (обязательная)", "^[0-9]{6,7}$", "0999999, где 0 - любая десятичная цифра (необязательная); 9 - любая десятичная цифра (обязательная)", 6),
  ID3(3, "Свидетельство о рождении", 3, "^.{0,25}$", "до 25 знаков", "^.{0,25}$", "до 25 знаков", 3),
  ID4(4, "Удостоверение личности офицера", 4, "^[А-Я]{2}$", "ББ, где Б - любая русская заглавная буква", "^[0-9]{6,7}$", "0999999, где 0 - любая десятичная цифра (необязательная); 9 - любая десятичная цифра (обязательная)", 25),
  ID5(5, "Справка об освобождении из мест лишения свободы", 5, "^.{0,25}$", "до 25 знаков", "^.{0,25}$", "до 25 знаков", 7),
  ID6(6, "Паспорт Минморфлота", 6, "^[А-Я]{2}$", "ББ, где Б - любая русская заглавная буква", "^[0-9]{6}$", "999999, где 9 - любая десятичная цифра (обязательная)", 23),
  ID7(7, "Военный билет", 7, "^[А-Я]{2}$", "ББ, где Б - любая русская заглавная буква", "^[0-9]{6,7}$", "0999999, где 0 - любая десятичная цифра (необязательная); 9 - любая десятичная цифра (обязательная)", 17),
  ID8(8, "Временное удостоверение, выданное взамен военного билета", 8, "^.{0,25}$", "до 25 знаков", "^.{0,25}$", "до 25 знаков", 19),
  ID9(9, "Дипломатический паспорт гражданина РФ", 9, "^[0-9]{2}$", "99, где 9 - любая десятичная цифра (обязательная)", "^[0-9]{7}$", "9999999, где 9 - любая десятичная цифра (обязательная)", 8),
  ID10(10, "Паспорт иностранного гражданина", 10, "^.{0,25}$", "до 25 знаков", "^.{0,25}$", "до 25 знаков", 11),
  ID11(11, "Свидетельство о рассмотрении ходатайства о признании лица беженцем на территории РФ по существу", 11, "^.{0,25}$", "до 25 знаков", "^.{0,25}$", "до 25 знаков", 14),
  ID12(12, "Вид на жительство в РФ", 12, "^.{0,200}$", "до 200 знаков", "^.{0,200}$", "до 200 знаков", 10),
  ID13(13, "Удостоверение беженца в РФ", 13, "^.{0,200}$", "до 200 знаков", "^.{0,200}$", "до 200 знаков", 16),
  ID14(14, "Временное удостоверение личности гражданина РФ", 14, "^.{0,25}$", "до 25 знаков", "^.{0,25}$", "до 25 знаков", 4),
  ID15(15, "Разрешение на временное проживание в РФ", 15, "^.{0,25}$", "до 25 знаков", "^.{0,25}$", "до 25 знаков", 12),
  ID16(16, "Свидетельство о предоставлении временного убежища на территории РФ", 18, "^[0-9]{0,2}$", "00, где 0 - любая десятичная цифра (необязательная)", "^[0-9]{0,7}$", "0000000, где 0 - любая десятичная цифра (необязательная)", 13),
  ID17(17, "Паспорт гражданина РФ", 21, "^[0-9]{4}$", "9999, где 9 - любая десятичная цифра (обязательная)", "^[0-9]{6,7}$", "9999990, где 9 - любая десятичная цифра (обязательная); 0 - любая десятичная цифра (необязательная)", 1),
  ID18(18, "Заграничный паспорт РФ", 22, "^[0-9]{2}$", "99, где 9 - любая десятичная цифра (обязательная)", "^[0-9]{7}$", "9999999, где 9 - любая десятичная цифра (обязательная)", 2),
  ID19(19, "Свидетельство о рождении, выданное уполномоченным органом иностранного государства", 23, "^.{0,25}$", "до 25 знаков", "^.{0,25}$", "до 25 знаков", 15),
  ID20(20, "Удостоверение личности военнослужащего РФ", 24, "^[А-Я]{2}$", "ББ, где Б - любая русская заглавная буква", "^[0-9]{7}$", "9999999, где  9 - любая десятичная цифра (обязательная)", 20),
  ID21(21, "Паспорт моряка", 26, "^[А-Я]{2}$", "ББ, где Б - любая русская заглавная буква", "^[0-9]{6,7}$", "0999999, где 0 - любая десятичная цифра (необязательная); 9 - любая десятичная цифра (обязательная)", 24),
  ID22(22, "Военный билет офицера запаса", 27, "^[А-Я]{2}$", "ББ, где Б - любая русская заглавная буква", "^[0-9]{6,7}$", "0999999, где 0 - любая десятичная цифра (необязательная); 9 - любая десятичная цифра (обязательная)", 18),
  ID23(23, "Иные документы", 91, "^.{0,25}$", "до 25 знаков", "^.{0,25}$", "до 25 знаков", 22),
  ID25(25, "Служебный паспорт гражданина РФ", null, "^.{0,25}$", "до 25 знаков", "^.{0,25}$", "до 25 знаков", 9),
  ID26(26, "Удостоверение личности моряка", null, "^.{0,25}$", "до 25 знаков", "^.{0,25}$", "до 25 знаков", 21);

  private static class DulTypesHolder {
    private static Map<Long, DulType> dulTypeById = new HashMap<>();
  }

  public static DulType getDulTypeById(long id) {
    return DulTypesHolder.dulTypeById.getOrDefault(id, null);
  }

  private long id;
  private String docName;
  private Integer docCode;
  private String seriesRegex;
  private String seriesRegexDesc;
  private String numberRegex;
  private String numberRegexDesc;
  private int sorting;

  DulType(long id, String docName, Integer docCode, String seriesRegex, String seriesRegexDesc, String numberRegex, String numberRegexDesc, int sorting) {
    this.id = id;
    this.docName = docName;
    this.docCode = docCode;
    this.seriesRegex = seriesRegex;
    this.seriesRegexDesc = seriesRegexDesc;
    this.numberRegex = numberRegex;
    this.numberRegexDesc = numberRegexDesc;
    this.sorting = sorting;

    DulTypesHolder.dulTypeById.put(id, this);
  }

  public long getId() {
    return id;
  }

  public String getDocName() {
    return docName;
  }

  public Integer getDocCode() {
    return docCode;
  }

  public String getSeriesRegex() {
    return seriesRegex;
  }

  public String getSeriesRegexDesc() {
    return seriesRegexDesc;
  }

  public String getNumberRegex() {
    return numberRegex;
  }

  public String getNumberRegexDesc() {
    return numberRegexDesc;
  }

  public int getSorting() {
    return sorting;
  }
}
