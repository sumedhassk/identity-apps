/**
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { TestableComponentInterface } from "@wso2is/core/models";
import { PrimaryButton } from "@wso2is/react-components";
import _ from "lodash";
import React, { FunctionComponent, MouseEvent, ReactElement, SyntheticEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { DropdownItemProps, DropdownProps, Icon, PaginationProps } from "semantic-ui-react";
import { getIdentityProviderList } from "../api";
import { AdvancedSearchWithBasicFilters, IdentityProviderList } from "../components";
import { handleGetIDPListCallError } from "../components/identity-providers/utils";
import { IdentityProviderConstants, UIConstants } from "../constants";
import { history } from "../helpers";
import { ListLayout, PageLayout } from "../layouts";
import { IdentityProviderListResponseInterface } from "../models";

/**
 * Proptypes for the IDP edit page component.
 */
type IDPPropsInterface = TestableComponentInterface

const IDENTITY_PROVIDER_LIST_SORTING_OPTIONS: DropdownItemProps[] = [
    {
        key: 1,
        text: "Name",
        value: "name"
    },
    {
        key: 2,
        text: "Type",
        value: "type"
    },
    {
        key: 3,
        text: "Created date",
        value: "createdDate"
    },
    {
        key: 4,
        text: "Last updated",
        value: "lastUpdated"
    }
];

/**
 * Overview page.
 *
 * @return {React.ReactElement}
 */
export const IdentityProvidersPage: FunctionComponent<IDPPropsInterface> = (
    props: IDPPropsInterface
): ReactElement => {

    const {
        [ "data-testid" ]: testId
    } = props;

    const { t } = useTranslation();

    const [ searchQuery, setSearchQuery ] = useState<string>("");
    const [ listSortingStrategy, setListSortingStrategy ] = useState<DropdownItemProps>(
        IDENTITY_PROVIDER_LIST_SORTING_OPTIONS[ 0 ]
    );
    const [ idpList, setIdPList ] = useState<IdentityProviderListResponseInterface>({});
    const [ listOffset, setListOffset ] = useState<number>(0);
    const [ listItemLimit, setListItemLimit ] = useState<number>(UIConstants.DEFAULT_RESOURCE_LIST_ITEM_LIMIT);
    const [ isIdPListRequestLoading, setIdPListRequestLoading ] = useState<boolean>(false);
    const [ triggerClearQuery, setTriggerClearQuery ] = useState<boolean>(false);

    /**
     * Retrieves the list of identity providers.
     *
     * @param {number} limit - List limit.
     * @param {number} offset - List offset.
     * @param {string} filter - Search query.
     */
    const getIdPList = (limit: number, offset: number, filter: string): void => {
        setIdPListRequestLoading(true);

        getIdentityProviderList(limit, offset, filter)
            .then((response) => {
                setIdPList(response);
            })
            .catch((error) => {
                handleGetIDPListCallError(error);
            })
            .finally(() => {
                setIdPListRequestLoading(false);
            });
    };

    /**
     * Called on every `listOffset` & `listItemLimit` change.
     */
    useEffect(() => {
        getIdPList(listItemLimit, listOffset, null);
    }, [ listOffset, listItemLimit ]);

    /**
     * Sets the list sorting strategy.
     *
     * @param {React.SyntheticEvent<HTMLElement>} event - The event.
     * @param {DropdownProps} data - Dropdown data.
     */
    const handleListSortingStrategyOnChange = (event: SyntheticEvent<HTMLElement>,
                                               data: DropdownProps): void => {
        setListSortingStrategy(_.find(IDENTITY_PROVIDER_LIST_SORTING_OPTIONS, (option) => {
            return data.value === option.value;
        }));
    };

    /**
     * Handles the `onFilter` callback action from the
     * identity provider search component.
     *
     * @param {string} query - Search query.
     */
    const handleIdentityProviderFilter = (query: string): void => {
        setSearchQuery(query);
        getIdPList(listItemLimit, listOffset, query);
    };

    /**
     * Handles the pagination change.
     *
     * @param {React.MouseEvent<HTMLAnchorElement>} event - Mouse event.
     * @param {PaginationProps} data - Pagination component data.
     */
    const handlePaginationChange = (event: MouseEvent<HTMLAnchorElement>, data: PaginationProps): void => {
        setListOffset((data.activePage as number - 1) * listItemLimit);
    };

    /**
     * Handles per page dropdown page.
     *
     * @param {React.MouseEvent<HTMLAnchorElement>} event - Mouse event.
     * @param {DropdownProps} data - Dropdown data.
     */
    const handleItemsPerPageDropdownChange = (event: MouseEvent<HTMLAnchorElement>,
                                              data: DropdownProps): void => {
        setListItemLimit(data.value as number);
    };

    /**
     * Handles identity provider delete action.
     */
    const handleIdentityProviderDelete = (): void => {
        getIdPList(listItemLimit, listOffset, null);
    };

    /**
     * Handles the `onSearchQueryClear` callback action.
     */
    const handleSearchQueryClear = (): void => {
        setSearchQuery("");
        getIdPList(listItemLimit, listOffset, null);
        setTriggerClearQuery(!triggerClearQuery);
    };

    return (
        <PageLayout
            title={ t("devPortal:pages.idp.title") }
            description={ t("devPortal:pages.idp.subTitle") }
            showBottomDivider={ true }
            data-testid={ `${ testId }-page-layout` }
        >
            <ListLayout
                advancedSearch={
                    <AdvancedSearchWithBasicFilters
                        onFilter={ handleIdentityProviderFilter  }
                        filterAttributeOptions={ [
                            {
                                key: 0,
                                text: t("common:name"),
                                value: "name"
                            }
                        ] }
                        filterAttributePlaceholder={
                            t("devPortal:components.idp.advancedSearch.form.inputs.filterAttribute.placeholder")
                        }
                        filterConditionsPlaceholder={
                            t("devPortal:components.idp.advancedSearch.form.inputs.filterCondition.placeholder")
                        }
                        filterValuePlaceholder={
                            t("devPortal:components.idp.advancedSearch.form.inputs.filterValue.placeholder")
                        }
                        placeholder={ t("devPortal:components.idp.advancedSearch.placeholder") }
                        defaultSearchAttribute="name"
                        defaultSearchOperator="co"
                        triggerClearQuery={ triggerClearQuery }
                        data-testid={ `${ testId }-advance-search` }
                    />
                }
                currentListSize={ idpList.count }
                listItemLimit={ listItemLimit }
                onItemsPerPageDropdownChange={ handleItemsPerPageDropdownChange }
                onPageChange={ handlePaginationChange }
                onSortStrategyChange={ handleListSortingStrategyOnChange }
                rightActionPanel={
                    (
                        <PrimaryButton
                            onClick={ (): void => {
                                history.push(IdentityProviderConstants.PATHS.get("IDENTITY_PROVIDER_TEMPLATES"));
                            } }
                            data-testid={ `${ testId }-add-button` }
                        >
                            <Icon name="add"/>{ t("devPortal:components.idp.buttons.addIDP") }
                        </PrimaryButton>
                    )
                }
                showPagination={ true }
                showTopActionPanel={ isIdPListRequestLoading || !(!searchQuery && idpList?.totalResults <= 0) }
                sortOptions={ IDENTITY_PROVIDER_LIST_SORTING_OPTIONS }
                sortStrategy={ listSortingStrategy }
                totalPages={ Math.ceil(idpList.totalResults / listItemLimit) }
                totalListSize={ idpList.totalResults }
                data-testid={ `${ testId }-list-layout` }
            >
                <IdentityProviderList
                    isLoading={ isIdPListRequestLoading }
                    list={ idpList }
                    onEmptyListPlaceholderActionClick={
                        () => history.push(IdentityProviderConstants.PATHS.get("IDENTITY_PROVIDER_TEMPLATES"))
                    }
                    onIdentityProviderDelete={ handleIdentityProviderDelete }
                    onSearchQueryClear={ handleSearchQueryClear }
                    searchQuery={ searchQuery }
                    data-testid={ `${ testId }-list` }
                />
            </ListLayout>
        </PageLayout>
    );
};

/**
 * Default proptypes for the IDP component.
 */
IdentityProvidersPage.defaultProps = {
    "data-testid": "idp"
};
