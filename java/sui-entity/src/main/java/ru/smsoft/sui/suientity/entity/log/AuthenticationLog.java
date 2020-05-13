package ru.smsoft.sui.suientity.entity.log;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import ru.smsoft.sui.suientity.entity.suisecurity.User;
import ru.smsoft.sui.suientity.enums.AuthenticationOperation;

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
public class AuthenticationLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String formLogin;
    private String remoteAddress;
    private String clientInfo;

    @Enumerated(EnumType.STRING)
    private AuthenticationOperation operation;

    @CreatedDate
    private Date created;

    @ManyToOne // No lazy
    private User user;

    @ManyToOne // No lazy
    private AuthenticationResult result;

}
