package ru.sui.suientity.entity.suimeta;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.*;
import org.hibernate.annotations.DynamicInsert;
import org.springframework.data.domain.Persistable;
import ru.sui.suientity.entity.suisecurity.Role;

import javax.persistence.*;
import java.io.IOException;
import java.util.Set;

// lombok annotations
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
@EqualsAndHashCode(of = {"tableInfo", "columnName"})
// JPA annotations
@Entity
@Table(schema = "sui_meta", name = "column_info")
@NamedEntityGraph(
        name = ColumnInfo.FULL_SCHEMA,
        attributeNodes = {
                @NamedAttributeNode("name"),
                @NamedAttributeNode("references"),
                @NamedAttributeNode("roles"),
                @NamedAttributeNode("tags"),
                @NamedAttributeNode("subtotalType"),
                @NamedAttributeNode("filterType")})
@DynamicInsert
public class ColumnInfo implements Persistable<Long> {

    public static final String FULL_SCHEMA = "full_schema";
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    private Name name;

    @ManyToOne
    private TableInfo tableInfo;

    private String columnName;
    private String defaultSorting;
    private String columnType;
    private String defaultValue;
    private String tableRenderParams;

    @Transient
    @Setter(AccessLevel.NONE)
    private ObjectNode parsedTableRenderParams;

    @Builder.Default
    private Boolean visible = false;
    @Builder.Default
    private Boolean defaultVisible = false;
    @Builder.Default
    private Boolean defaultGrouping = false;
    @Builder.Default
    private Boolean isNullable = false;

    @Builder.Default
    private Integer width = 200;

    @Column(name = "\"order\"") // keyword
    private Integer order;

    @ManyToOne(fetch = FetchType.LAZY)
    private SubtotalType subtotalType;

    @ManyToOne(fetch = FetchType.LAZY)
    private FilterType filterType;

    // Don't change to list
    // Don't add orphanRemoval = true (conflict with psql ON DELETE CASCADE)
    @OneToMany(mappedBy = "columnInfo", cascade = CascadeType.ALL)
    @Singular
    @JsonBackReference("references")
    private Set<ColumnInfoReference> references;

    // Don't change to list
    // Doesn't add @Singular
    @ManyToMany
    @JoinTable(
            schema = "sui_meta",
            name = "column_info_role",
            joinColumns = @JoinColumn(name = "column_info_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id"))
    private Set<Role> roles;

    // Don't change to list
    @ManyToMany
    @JoinTable(
            schema = "sui_meta",
            name = "column_info_tag",
            joinColumns = @JoinColumn(name = "column_info_id"),
            inverseJoinColumns = @JoinColumn(name = "tag_id"))
    @Singular
    private Set<Tag> tags;

    @Override
    public boolean isNew() {
        return this.id == null;
    }

    @SneakyThrows(IOException.class)
    public ObjectNode getParsedTableRenderParams() {
        if (this.parsedTableRenderParams == null && this.tableRenderParams != null) {
            this.parsedTableRenderParams = (ObjectNode) OBJECT_MAPPER.readTree(this.tableRenderParams);
        }

        return this.parsedTableRenderParams;
    }

}
