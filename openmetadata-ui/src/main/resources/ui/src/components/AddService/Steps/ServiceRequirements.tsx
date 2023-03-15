/*
 *  Copyright 2023 Collate.
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
import { Button, Col, Row } from 'antd';
import RichTextEditorPreviewer from 'components/common/rich-text-editor/RichTextEditorPreviewer';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';

interface ServiceRequirementsProp {
  selectServiceType: string;
  onCancel: () => void;
  onNext: () => void;
}

const ServiceRequirements: FC<ServiceRequirementsProp> = ({
  selectServiceType,
  onCancel,
  onNext,
}) => {
  const { t } = useTranslation();

  const markdownText = t('requirement', { ns: selectServiceType });

  return (
    <Row data-testid="service-requirements">
      <Col span={24}>
        <RichTextEditorPreviewer
          enableSeeMoreVariant={false}
          markdown={markdownText}
          maxLength={markdownText.length}
        />
      </Col>
      <Col className="d-flex justify-end mt-12" span={24}>
        <Button
          className="m-r-xs"
          data-testid="previous-button"
          type="link"
          onClick={onCancel}>
          {t('label.cancel')}
        </Button>

        <Button
          className="font-medium p-x-md p-y-xxs h-auto rounded-6"
          data-testid="next-button"
          type="primary"
          onClick={onNext}>
          {t('label.next')}
        </Button>
      </Col>
    </Row>
  );
};

export default ServiceRequirements;
