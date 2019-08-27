package ru.smsoft.sui.suientity.entity.suisecurity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import lombok.*;
import org.hibernate.annotations.NaturalId;
import ru.smsoft.sui.suientity.converter.RoleNameConverter;
import ru.smsoft.sui.suientity.entity.suimeta.ColumnInfo;
import ru.smsoft.sui.suientity.enums.RoleName;

import javax.persistence.*;
import java.io.Serializable;
import java.util.List;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
@Entity
@EqualsAndHashCode(of = "name")
@Table(schema = "sui_security", name = "roles")
@NamedEntityGraph(
        name = Role.WITH_USERS,
        attributeNodes = @NamedAttributeNode("users"))
public class Role implements Serializable {

    public static final String WITH_USERS = "with_users";

    @Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NaturalId
    private String name;

    @Column(name = "name", insertable = false, updatable = false)
    @Convert(converter = RoleNameConverter.class)
    private RoleName roleName;

    // bi-directional many-to-many association to User
    @ManyToMany(mappedBy = "roles")
    @Singular
    private List<User> users;

    // bi-directional many-to-many association to ColumnInfo
    @ManyToMany
    @JoinTable(
            schema = "sui_meta",
            name = "column_info_role",
            joinColumns = @JoinColumn(name = "role_id"),
            inverseJoinColumns = @JoinColumn(name = "column_info_id"))
    @Singular
    @JsonBackReference("columnInfos")
    private Set<ColumnInfo> columnInfos;

    private void setRoleName(RoleName roleName) {
        throw new UnsupportedOperationException("Method not supported");
    }

    private void setName(String name) {
        this.name = name;
        this.roleName = RoleName.getEnumValue(name);
    }

}