package ru.smsoft.sui.suientity.entity.suimeta;

import com.fasterxml.jackson.annotation.JsonBackReference;
import lombok.*;

import javax.persistence.*;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
@Entity
@Table(schema = "sui_meta", name = "subtotal_type")
public class SubtotalType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String expression;

    @OneToMany(mappedBy = "subtotalType")
    @Singular
    @JsonBackReference("columnInfos")
    private Set<ColumnInfo> columnInfos;

}
