import {DBUniqueValidator} from "@/validator/DBUniqueValidator";

export async function PersonUniqueFieldValidator<T = string>(fieldName: string,
                                                             fieldValue: T,
                                                             errMessage: string,
                                                             excludePersonId: string = null,
                                                             linkToEntity: (idFieldName: string, entityId: string, errMessage: string) => void,
                                                             includeDeletedPeople: boolean = true): Promise<any> {
  return new Promise((resolve, reject): any => {
    DBUniqueValidator("allPeople", {[fieldName]: fieldValue, 'deleted': includeDeletedPeople}, 'id', excludePersonId)
      .then(data => {
        if (data.table.totalCount > 0) {
          reject(linkToEntity('id', data.table.nodes[0].__id, errMessage));
        } else {
          resolve();
        }
      })
      .catch(err => reject(`Ошибка чтения данных из БД. Попробуйте снова ввести значение\n${err}`));
  });
}
