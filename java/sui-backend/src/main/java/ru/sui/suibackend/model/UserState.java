package ru.sui.suibackend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import ru.sui.suibackend.message.model.ExpandedGroup;
import ru.sui.suibackend.message.model.Grouping;
import ru.sui.suibackend.message.model.Sorting;
import ru.sui.suibackend.message.model.filtering.Filtering;
import ru.sui.suibackend.service.MetaAccessService;

import java.util.Collection;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder(toBuilder = true)
public class UserState {

    private MetaAccessService.MetaData metaData;
    private Long offset;
    private Long pageSize;
    private List<Grouping> groupings;
    private List<ExpandedGroup> expandedGroups;
    private List<Sorting> sorts;
    private List<Filtering> globalFilters;
    private List<Filtering> filters;
    private Collection<String> selection;

    // TODO: Орефлексить
    public void clear() {
        this.metaData = null;
        this.offset = null;
        this.pageSize = null;
        this.groupings = null;
        this.expandedGroups = null;
        this.sorts = null;
        this.globalFilters = null;
        this.filters = null;
        this.selection = null;
    }

    public UserState copy() {
        return this.toBuilder().build();
    }

    public MetaAccessService.MetaData getMetaData() {
        return metaData;
    }

    public void setMetaData(MetaAccessService.MetaData metaData) {
        this.metaData = metaData;
    }

    public Long getOffset() {
        return offset;
    }

    public void setOffset(Long offset) {
        this.offset = offset;
    }

    public Long getPageSize() {
        return pageSize;
    }

    public void setPageSize(Long pageSize) {
        this.pageSize = pageSize;
    }

    public List<Grouping> getGroupings() {
        return groupings;
    }

    public void setGroupings(List<Grouping> groupings) {
        this.groupings = groupings;
    }

    public List<ExpandedGroup> getExpandedGroups() {
        return expandedGroups;
    }

    public void setExpandedGroups(List<ExpandedGroup> expandedGroups) {
        this.expandedGroups = expandedGroups;
    }

    public List<Sorting> getSorts() {
        return sorts;
    }

    public void setSorts(List<Sorting> sorts) {
        this.sorts = sorts;
    }

    public List<Filtering> getGlobalFilters() {
        return globalFilters;
    }

    public void setGlobalFilters(List<Filtering> globalFilters) {
        this.globalFilters = globalFilters;
    }

    public List<Filtering> getFilters() {
        return filters;
    }

    public void setFilters(List<Filtering> filters) {
        this.filters = filters;
    }

    public Collection<String> getSelection() {
        return selection;
    }

    public void setSelection(Collection<String> selection) {
        this.selection = selection;
    }

}
