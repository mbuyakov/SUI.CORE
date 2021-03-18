import {DBUniqueValidator} from "@/validator/DBUniqueValidator";

export async function PersonUniqueFieldValidator<T = string>(fieldName: string,
                                                             fieldValue: T,
                                                             excludePersonId: string = null,
                                                             linkToEntity: (idFieldName: string, entityId: string) => void): Promise<any> {
  return new Promise((resolve, reject): any => {
    DBUniqueValidator("allPeople", {fieldName: fieldValue, 'deleted': false}, 'id', excludePersonId)
      .then(data => {
        if (data.table.totalCount > 0) {
          reject(linkToEntity('id', data.table.nodes[0].__id));
        } else {
          resolve();
        }
      })
      .catch(err => reject(`Ошибка чтения данных из БД. Попробуйте снова ввести значение\n${err}`));
  });
}
