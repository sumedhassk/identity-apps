/**
* Copyright (c) 2020, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
*
* WSO2 Inc. licenses this file to you under the Apache License,
* Version 2.0 (the 'License'); you may not use this file except
* in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* 'AS IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied. See the License for the
* specific language governing permissions and limitations
* under the License.
*/

import { ResourceTab } from "@wso2is/react-components";
import React, { ReactElement, useEffect, useState } from "react"
import { useDispatch } from "react-redux";
import { getAType, getAUserStore } from "../api";
import {
    EditBasicDetailsUserStore,
    EditConnectionDetails,
    MemoEditOptionalProperties
} from "../components";
import { EditGroupDetails } from "../components/user-stores/edit/edit-group-details-userstore";
import { EditUserDetails } from "../components/user-stores/edit/edit-user-details-userstore";
import { history } from "../helpers";
import { PageLayout } from "../layouts"
import { AlertLevels, CategorizedProperties, UserStore, UserstoreType } from "../models";
import { addAlert } from "../store/actions";
import { reOrganizeProperties } from "../utils";

/**
 * This renders the userstore edit page
 * @param props 
 * @return {ReactElement}
 */
export const UserStoresEditPage = (props): ReactElement => {

    const userStoreId = props.match.params.id;

    const [ userStore, setUserStore ] = useState<UserStore>(null);
    const [ type, setType ] = useState<UserstoreType>(null);
    const [ properties, setProperties ] = useState<CategorizedProperties>(null);

    const dispatch = useDispatch();

    /**
     * Fetches the suer store by its id
     */
    const getUserStore = () => {
        getAUserStore(userStoreId).then(response => {
            setUserStore(response);
        }).catch(error => {
            dispatch(addAlert(
                {
                    description: error?.description,
                    level: AlertLevels.ERROR,
                    message: error?.message
                }
            ));
        })
    }

    useEffect(() => {
        getUserStore();
    }, []);

    useEffect(() => {
        if (userStore) {
            getAType(userStore?.typeId, null).then((response) => {
                setType(response);
            }).catch(error => {
                dispatch(addAlert({
                    description: error?.description || "An error occurred while fetching the type meta data.",
                    level: AlertLevels.ERROR,
                    message: error?.message || "Something went wrong"
                }));
            });
        }
    }, [ userStore ]);

    useEffect(() => {
        if (type) {
            setProperties(reOrganizeProperties(type.properties, userStore.properties));
        }
    }, [ type ])

    /**
     * The tab panes
     */
    const panes = [
        {
            menuItem: "Basic Details",
            render: () => (
                <EditBasicDetailsUserStore
                    userStore={ userStore }
                    update={ getUserStore }
                    id={ userStoreId }
                />
            )
        },
        {
            menuItem: "Connection Details",
            render: () => (
                <EditConnectionDetails
                    update={ getUserStore }
                    type={ type }
                    id={ userStoreId }
                    properties={ properties.connection }
                />
            )
        },
        {
            menuItem: "User Details",
            render: () => (
                <EditUserDetails
                    update={ getUserStore }
                    type={ type }
                    id={ userStoreId }
                    properties={ properties.user }
                />
            )
        },
        {
            menuItem: "Group Details",
            render: () => (
                <EditGroupDetails
                    update={ getUserStore }
                    type={ type }
                    id={ userStoreId }
                    properties={ properties.group }
                />
            )
        }
    ];

    return (
        <PageLayout
            title={ userStore?.name }
            description={ "Edit userstore" }
            backButton={ {
                onClick: () => {
                    history.push("/user-stores");
                },
                text: "Go back to userstores"
            } }
            titleTextAlign="left"
            bottomMargin={ false }
        >
            <ResourceTab panes={ panes } />
        </PageLayout>
    )
}
