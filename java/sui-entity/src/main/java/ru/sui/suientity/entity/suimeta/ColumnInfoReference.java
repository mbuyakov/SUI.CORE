package ru.sui.suientity.entity.suimeta;

import lombok.*;
import org.springframework.data.domain.Persistable;

import javax.persistence.*;

@Getter
@Setter
@EqualsAndHashCode(of = {"columnInfo", "foreignColumnInfo"})
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
@Entity
@Table(schema = "sui_meta", name = "column_info_reference")
public class ColumnInfoReference implements Persistable<Long> {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne // нет смысла делать lazy
    private ColumnInfo columnInfo;

    @ManyToOne // нет смысла делать lazy
    private ColumnInfo foreignColumnInfo;

    @Override
    public boolean isNew() {
        return this.id == null;
    }

}
