package ru.sui.suientity.entity.log;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import ru.sui.suientity.entity.suimeta.TableInfo;
import ru.sui.suientity.entity.suisecurity.User;

import javax.persistence.*;
import java.util.Date;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
@Entity
@Table(schema = "log")
@EntityListeners(AuditingEntityListener.class)
public class TableExportLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer rowCount;

    @CreatedDate
    private Date ts;

    @ManyToOne // No LAZY
    private TableInfo tableInfo;
    @ManyToOne // No LAZY
    private User user;

}
