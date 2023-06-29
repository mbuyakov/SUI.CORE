/* eslint-disable @typescript-eslint/no-explicit-any */
import {DBUniqueValidator} from "@/validator/DBUniqueValidator";
import {IObjectWithIndex} from "@sui/util-types";

export async function PersonUniqueFieldValidator<T = string>(
  fieldName: string,
  fieldValue: T,
  errMessage: string,
  // eslint-disable-next-line default-param-last
  excludePersonId: string = null,
  linkToEntity: (idFieldName: string, entityId: string, errMessage: string) => void,
  excludeDeletedPeople?: boolean
): Promise<any> {
  return new Promise((resolve, reject): any => {
    let queryFields: IObjectWithIndex = !!excludeDeletedPeople ? {deleted: false} : {};
    queryFields = {
      ...queryFields,
      [fieldName]: fieldValue
    };
    DBUniqueValidator("allPeople", queryFields, "id", excludePersonId)
      .then(data => {
        if (data.table.totalCount > 0) {
          reject(linkToEntity("id", data.table.nodes[0].__id, errMessage));
        } else {
          resolve(undefined);
        }
      })
      .catch(err => reject(`Ошибка чтения данных из БД. Попробуйте снова ввести значение\n${err}`));
  });
}
