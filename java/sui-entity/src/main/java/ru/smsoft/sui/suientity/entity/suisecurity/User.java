package ru.smsoft.sui.suientity.entity.suisecurity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import lombok.*;
import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.GenericGenerator;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import javax.persistence.*;
import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import java.io.Serializable;
import java.util.Date;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = {"id", "email", "name"})
@Builder(toBuilder = true)
@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(
        schema = "sui_security",
        name = "users",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = {"username"}),
                @UniqueConstraint(columnNames = {"email"})})
@NamedEntityGraph(
        name = User.WITH_ROLES,
        attributeNodes = @NamedAttributeNode("roles"))
@DynamicInsert
public class User implements Serializable {

    public static final long SYSTEM_USER_ID = -1;
    public static final String WITH_ROLES = "userWithRoles";

    @Id
    @GeneratedValue(generator = "lazyIdentityGenerator")
    @GenericGenerator(name = "lazyIdentityGenerator", strategy = "ru.smsoft.sui.suientity.generator.LazyIdentityGenerator")
    private Long id;

    @CreatedDate
    private Date created;

    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String name;

    @NotBlank
    private String password;

    @LastModifiedDate
    private Date updated;

    @NotBlank
    private String username;

    private Boolean deleted;

    //bi-directional many-to-many association to Role
    @ManyToMany
    @JoinTable(
            schema = "sui_security",
            name = "user_roles",
            joinColumns = {@JoinColumn(name = "user_id")},
            inverseJoinColumns = {@JoinColumn(name = "role_id")})
    @Singular
    @JsonBackReference("roles")
    private Set<Role> roles;

}
