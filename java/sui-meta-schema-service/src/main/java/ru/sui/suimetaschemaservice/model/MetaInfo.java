package ru.sui.suimetaschemaservice.model;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.Collection;
import java.util.Map;

@Getter
@Setter
@AllArgsConstructor
public class MetaInfo<E, V> {

    private Map<E, V> metaElementMap;

    private Collection<V> newElements;

    private Collection<V> nonexistentElements;

}
