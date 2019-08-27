package ru.smsoft.sui.suientity.entity.suimeta;

import com.fasterxml.jackson.annotation.JsonBackReference;
import lombok.*;

import javax.persistence.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
@Entity
@Table(schema = "sui_meta", name = "name")
public class Name {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String description;

    @OneToMany(mappedBy = "name")
    @Singular
    @JsonBackReference("columnInfos")
    private List<ColumnInfo> columnInfos;

    @OneToMany(mappedBy = "name")
    @Singular
    @JsonBackReference("tableInfos")
    private List<TableInfo> tableInfos;

}
