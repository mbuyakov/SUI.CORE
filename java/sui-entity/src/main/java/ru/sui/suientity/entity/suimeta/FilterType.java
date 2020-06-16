package ru.sui.suientity.entity.suimeta;

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
@Table(schema = "sui_meta", name = "filter_type")
public class FilterType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String type;

    private String name;

    @OneToMany(mappedBy = "filterType")
    @Singular
    @JsonBackReference("columnInfos")
    private Set<ColumnInfo> columnInfos;

}
