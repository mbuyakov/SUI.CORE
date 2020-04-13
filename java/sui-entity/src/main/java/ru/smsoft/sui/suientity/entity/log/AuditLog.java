package ru.smsoft.sui.suientity.entity.log;

import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import ru.smsoft.sui.suientity.converter.ObjectNodeConverter;
import ru.smsoft.sui.suientity.entity.suimeta.TableInfo;
import ru.smsoft.sui.suientity.entity.suisecurity.User;

import javax.persistence.*;
import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
@Entity
@Table(schema = "log", name = "audit_log")
@EntityListeners(AuditingEntityListener.class)
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String operationType;
    private String rowId;
    private String dbUser;

    @Convert(converter = ObjectNodeConverter.class)
    private ObjectNode content;

    @CreatedDate
    private Date created;

    @ManyToOne
    private TableInfo tableInfo;
    @ManyToOne
    private User user;

}
