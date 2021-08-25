import {Observable} from "./Observable";

export function joinObservables2<K1, K2>(
  observable1: Observable<K1>,
  observable2: Observable<K2>
): Observable<[K1, K2]> {
  const result = new Observable<[K1, K2]>([observable1.getValue(), observable2.getValue()]);
  observable1.subscribe(value1 => result.setValue([value1, observable2.getValue()]));
  observable2.subscribe(value2 => result.setValue([observable1.getValue(), value2]));
  return result;
}

export function joinObservables3<K1, K2, K3>(
  observable1: Observable<K1>,
  observable2: Observable<K2>,
  observable3: Observable<K3>
): Observable<[K1, K2, K3]> {
  const result = new Observable<[K1, K2, K3]>([observable1.getValue(), observable2.getValue(), observable3.getValue()]);
  observable1.subscribe(value1 => result.setValue([value1, observable2.getValue(), observable3.getValue()]));
  observable2.subscribe(value2 => result.setValue([observable1.getValue(), value2, observable3.getValue()]));
  observable3.subscribe(value3 => result.setValue([observable1.getValue(), observable2.getValue(), value3]));
  return result;
}

export function joinObservables4<K1, K2, K3, K4>(
  observable1: Observable<K1>,
  observable2: Observable<K2>,
  observable3: Observable<K3>,
  observable4: Observable<K4>
): Observable<[K1, K2, K3, K4]> {
  const result = new Observable<[K1, K2, K3, K4]>([observable1.getValue(), observable2.getValue(), observable3.getValue(), observable4.getValue()]);
  observable1.subscribe(value1 => result.setValue([value1, observable2.getValue(), observable3.getValue(), observable4.getValue()]));
  observable2.subscribe(value2 => result.setValue([observable1.getValue(), value2, observable3.getValue(), observable4.getValue()]));
  observable3.subscribe(value3 => result.setValue([observable1.getValue(), observable2.getValue(), value3, observable4.getValue()]));
  observable4.subscribe(value4 => result.setValue([observable1.getValue(), observable2.getValue(), observable3.getValue(), value4]));
  return result;
}

export function joinObservables5<K1, K2, K3, K4, K5>(
  observable1: Observable<K1>,
  observable2: Observable<K2>,
  observable3: Observable<K3>,
  observable4: Observable<K4>,
  observable5: Observable<K5>
): Observable<[K1, K2, K3, K4, K5]> {
  const result = new Observable<[K1, K2, K3, K4, K5]>([observable1.getValue(), observable2.getValue(), observable3.getValue(), observable4.getValue(), observable5.getValue()]);
  observable1.subscribe(value1 => result.setValue([value1, observable2.getValue(), observable3.getValue(), observable4.getValue(), observable5.getValue()]));
  observable2.subscribe(value2 => result.setValue([observable1.getValue(), value2, observable3.getValue(), observable4.getValue(), observable5.getValue()]));
  observable3.subscribe(value3 => result.setValue([observable1.getValue(), observable2.getValue(), value3, observable4.getValue(), observable5.getValue()]));
  observable4.subscribe(value4 => result.setValue([observable1.getValue(), observable2.getValue(), observable3.getValue(), value4, observable5.getValue()]));
  observable5.subscribe(value5 => result.setValue([observable1.getValue(), observable2.getValue(), observable3.getValue(), observable4.getValue(), value5]));
  return result;
}

export function joinObservables6<K1, K2, K3, K4, K5, K6>(
  observable1: Observable<K1>,
  observable2: Observable<K2>,
  observable3: Observable<K3>,
  observable4: Observable<K4>,
  observable5: Observable<K5>,
  observable6: Observable<K6>
): Observable<[K1, K2, K3, K4, K5, K6]> {
  const result = new Observable<[K1, K2, K3, K4, K5, K6]>([observable1.getValue(), observable2.getValue(), observable3.getValue(), observable4.getValue(), observable5.getValue(), observable6.getValue()]);
  observable1.subscribe(value1 => result.setValue([value1, observable2.getValue(), observable3.getValue(), observable4.getValue(), observable5.getValue(), observable6.getValue()]));
  observable2.subscribe(value2 => result.setValue([observable1.getValue(), value2, observable3.getValue(), observable4.getValue(), observable5.getValue(), observable6.getValue()]));
  observable3.subscribe(value3 => result.setValue([observable1.getValue(), observable2.getValue(), value3, observable4.getValue(), observable5.getValue(), observable6.getValue()]));
  observable4.subscribe(value4 => result.setValue([observable1.getValue(), observable2.getValue(), observable3.getValue(), value4, observable5.getValue(), observable6.getValue()]));
  observable5.subscribe(value5 => result.setValue([observable1.getValue(), observable2.getValue(), observable3.getValue(), observable4.getValue(), value5, observable6.getValue()]));
  observable6.subscribe(value6 => result.setValue([observable1.getValue(), observable2.getValue(), observable3.getValue(), observable4.getValue(), observable5.getValue(), value6]));
  return result;
}
