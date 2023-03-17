/*
 *  Copyright 2022 Collate.
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *  http://www.apache.org/licenses/LICENSE-2.0
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

import { Button, Col, Divider, Row, Space, Typography } from 'antd';
import classNames from 'classnames';
import Description from 'components/common/description/Description';
import OwnerWidgetWrapper from 'components/common/OwnerWidget/OwnerWidgetWrapper.component';
import ProfilePicture from 'components/common/ProfilePicture/ProfilePicture';
import TagsContainer from 'components/Tag/TagsContainer/tags-container';
import TagsViewer from 'components/Tag/TagsViewer/tags-viewer';
import { getUserPath } from 'constants/constants';
import { SettledStatus } from 'enums/axios.enum';
import { Query } from 'generated/entity/data/query';
import { Table } from 'generated/entity/data/table';
import { LabelType, State, TagLabel, TagSource } from 'generated/type/tagLabel';
import { isEmpty, isUndefined } from 'lodash';
import { EntityTags, TagOption } from 'Models';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { getEntityName } from 'utils/EntityUtils';
import { fetchGlossaryTerms, getGlossaryTermlist } from 'utils/GlossaryUtils';
import { getClassifications, getTaglist } from 'utils/TagsUtils';
import { ReactComponent as EditIcon } from '/assets/svg/ic-edit.svg';

interface TableQueryRightPanelProps {
  query: Query;
  onQueryUpdate: (updatedQuery: Query) => Promise<void>;
}

const TableQueryRightPanel = ({
  query,
  onQueryUpdate,
}: TableQueryRightPanelProps) => {
  const { t } = useTranslation();
  const [isEditOwner, setIsEditOwner] = useState(false);
  const [isEditDescription, setIsEditDescription] = useState(false);
  const [isEditTags, setIsEditTags] = useState(false);
  const [tagDetails, setTagDetails] = useState<{
    isLoading: boolean;
    options: TagOption[];
    isError: boolean;
  }>({
    isLoading: false,
    options: [],
    isError: false,
  });

  const fetchTagsAndGlossaryTerms = () => {
    setTagDetails((pre) => ({ ...pre, isLoading: true }));
    Promise.allSettled([getClassifications(), fetchGlossaryTerms()])
      .then(async (values) => {
        let tagsAndTerms: TagOption[] = [];
        if (
          values[0].status === SettledStatus.FULFILLED &&
          values[0].value.data
        ) {
          const tagList = await getTaglist(values[0].value.data);

          tagsAndTerms = isEmpty(tagList)
            ? []
            : tagList.map((tag) => {
                return {
                  fqn: tag,
                  source: TagSource.Classification,
                };
              });
        }
        if (
          values[1].status === SettledStatus.FULFILLED &&
          values[1].value &&
          values[1].value.length > 0
        ) {
          const glossaryTerms: TagOption[] = getGlossaryTermlist(
            values[1].value
          ).map((tag) => {
            return { fqn: tag, source: TagSource.Glossary };
          });
          tagsAndTerms = [...tagsAndTerms, ...glossaryTerms];
        }
        setTagDetails((pre) => ({ ...pre, options: tagsAndTerms }));

        if (
          values[0].status !== SettledStatus.FULFILLED &&
          values[1].status !== SettledStatus.FULFILLED
        ) {
          setTagDetails((pre) => ({ ...pre, isError: true }));
        }
      })
      .catch(() => {
        setTagDetails((pre) => ({ ...pre, isError: true, options: [] }));
      })
      .finally(() => {
        setTagDetails((pre) => ({ ...pre, isLoading: false }));
      });
  };

  const handleRemoveOwner = async () => {
    const updatedData = {
      ...query,
      owner: undefined,
    };
    await onQueryUpdate(updatedData);
    setIsEditOwner(false);
  };
  const handleUpdateOwner = async (owner: Table['owner']) => {
    if (!isUndefined(owner)) {
      const updatedData = {
        ...query,
        owner,
      };
      await onQueryUpdate(updatedData);
      setIsEditOwner(false);
    }
  };
  const onDescriptionUpdate = async (description: string) => {
    const updatedData = {
      ...query,
      description,
    };
    await onQueryUpdate(updatedData);
    setIsEditDescription(false);
  };
  const handleTagSelection = async (selectedTags?: EntityTags[]) => {
    const newSelectedTags: TagLabel[] | undefined = selectedTags?.map((tag) => {
      return {
        source: tag.source,
        tagFQN: tag.tagFQN,
        labelType: LabelType.Manual,
        state: State.Confirmed,
      };
    });
    if (newSelectedTags) {
      const updatedData = {
        ...query,
        tags: newSelectedTags,
      };
      await onQueryUpdate(updatedData);
      setIsEditTags(false);
    }
  };

  const isReadOnly = false;

  return (
    <Row className="m-t-md" gutter={[8, 8]}>
      <Col span={24}>
        <div className="flex items-center justify-between relative p-x-md">
          <Typography.Text className="text-grey-muted">
            {t('label.owner')}
          </Typography.Text>

          <Button
            className="flex-center p-0"
            icon={<EditIcon height={16} width={16} />}
            size="small"
            type="text"
            onClick={() => setIsEditOwner(true)}
          />
          {isEditOwner && (
            <OwnerWidgetWrapper
              horzPosRight
              className="top-6"
              currentUser={query.owner}
              hideWidget={() => setIsEditOwner(false)}
              removeOwner={handleRemoveOwner}
              updateUser={handleUpdateOwner}
              visible={isEditOwner}
            />
          )}
        </div>
      </Col>
      <Col span={24}>
        <div className="p-x-md">
          {query.owner && getEntityName(query.owner) ? (
            <Space className="m-r-xss" size={4}>
              <ProfilePicture
                displayName={getEntityName(query.owner)}
                id={query.owner?.id || ''}
                name={query.owner?.name || ''}
                width="26"
              />
              <Link to={getUserPath(query.owner.name ?? '')}>
                {getEntityName(query.owner)}
              </Link>
            </Space>
          ) : (
            <span className="text-grey-muted">
              {t('label.no-entity', {
                entity: t('label.owner-lowercase'),
              })}
            </span>
          )}
        </div>
      </Col>
      <Col span={24}>
        <Divider className="m-y-md" />
      </Col>
      <Col span={24}>
        <div className="p-x-md">
          <Space align="center" className="justify-between w-full">
            <Typography.Text className="text-grey-muted">
              {t('label.description')}
            </Typography.Text>

            <Button
              className="flex-center p-0"
              icon={<EditIcon height={16} width={16} />}
              size="small"
              type="text"
              onClick={() => setIsEditDescription(true)}
            />
          </Space>
        </div>
      </Col>
      <Col span={24}>
        <Description
          className="p-x-md"
          description={query?.description || ''}
          entityName={query?.displayName ?? query?.name}
          isEdit={isEditDescription}
          onCancel={() => setIsEditDescription(false)}
          onDescriptionUpdate={onDescriptionUpdate}
        />
      </Col>
      <Col span={24}>
        <Divider className="m-y-md" />
      </Col>
      <Col span={24}>
        <Typography.Text className="text-grey-muted p-x-md">
          {t('label.tag-plural')}
        </Typography.Text>
      </Col>
      <Col span={24}>
        <div className="p-x-md">
          {isReadOnly ? (
            <TagsViewer sizeCap={-1} tags={query?.tags || []} />
          ) : (
            <div
              className={classNames(
                `tw-flex tw-justify-content`,
                !isUndefined(query?.tags)
                  ? 'tw-flex-col tw-items-start'
                  : 'tw-items-center'
              )}
              data-testid="tags-wrapper"
              onClick={() => {
                // Fetch tags and terms only once
                setIsEditTags(true);
                if (isEmpty(tagDetails.options) || tagDetails.isError) {
                  fetchTagsAndGlossaryTerms();
                }
              }}>
              <TagsContainer
                showAddTagButton
                className="w-min-15 "
                editable={isEditTags}
                isLoading={tagDetails.isLoading}
                selectedTags={query?.tags || []}
                size="small"
                tagList={tagDetails.options}
                type="label"
                onCancel={() => setIsEditTags(false)}
                onSelectionChange={handleTagSelection}
              />
            </div>
          )}
        </div>
      </Col>
      <Col span={24}>
        <Divider className="m-y-md" />
      </Col>
    </Row>
  );
};

export default TableQueryRightPanel;
