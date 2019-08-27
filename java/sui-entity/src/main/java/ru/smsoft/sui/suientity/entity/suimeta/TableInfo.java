package ru.smsoft.sui.suientity.entity.suimeta;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;
import org.hibernate.annotations.DynamicInsert;
import org.springframework.data.domain.Persistable;

import javax.persistence.*;
import java.util.Set;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
@EqualsAndHashCode(of = {"tableName", "schemaName"})
@Entity
@Table(schema = "sui_meta", name = "table_info")
@DynamicInsert
@NamedEntityGraphs({
        @NamedEntityGraph(
                name = TableInfo.WITH_COLUMN_INFOS_AND_REFERENCES,
                attributeNodes = @NamedAttributeNode(value = "columnInfos", subgraph = "columnInfoSubgraph"),
                subgraphs = @NamedSubgraph(
                        name = "columnInfoSubgraph",
                        attributeNodes = {
                                @NamedAttributeNode("references")})),
        @NamedEntityGraph(
                name = TableInfo.WITH_COLUMN_INFOS_AND_ROLES,
                attributeNodes = @NamedAttributeNode(value = "columnInfos", subgraph = "columnInfoSubgraph"),
                subgraphs = @NamedSubgraph(
                        name = "columnInfoSubgraph",
                        attributeNodes = {
                                @NamedAttributeNode("roles")})),
        @NamedEntityGraph(
                name = TableInfo.FULL_SCHEMA,
                attributeNodes = @NamedAttributeNode(value = "columnInfos", subgraph = "columnInfoSubgraph"),
                subgraphs = {
                        @NamedSubgraph(
                                name = "columnInfoSubgraph",
                                attributeNodes = {
                                        @NamedAttributeNode("roles"),
                                        @NamedAttributeNode("references"),
                                        @NamedAttributeNode("subtotalType"),
                                        @NamedAttributeNode("filterType")})})})
public class TableInfo implements Persistable<Long> {

    public static final String WITH_COLUMN_INFOS_AND_REFERENCES = "tableInfoWithColumnInfosAndReferences";

    public static final String WITH_COLUMN_INFOS_AND_ROLES = "tableInfoWithColumnInfosAndRoles";

    public static final String FULL_SCHEMA
            = "tableInfoWithColumnInfoAndRolesAndReferencesAndSubtotalTypesAndFilterTypes";

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long engineId;

    private String tableName;

    private String schemaName;

    private String type;

    private Boolean isCatalog;

    @ManyToOne(fetch = FetchType.LAZY)
    private Name name;

    @OneToOne(fetch = FetchType.LAZY)
    @JsonIgnore
    private ColumnInfo linkColumnInfo;

    @OneToOne(fetch = FetchType.LAZY)
    @JsonIgnore
    private ColumnInfo foreignLinkColumnInfo;

    // Don't change to list
    @OneToMany(mappedBy = "tableInfo", cascade = {CascadeType.ALL}, orphanRemoval = true)
    @Singular
    @JsonBackReference("columnInfos")
    private Set<ColumnInfo> columnInfos;

    @Override
    public boolean isNew() {
        return this.id == null;
    }

}