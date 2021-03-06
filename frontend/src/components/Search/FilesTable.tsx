import {
  DownCircleOutlined,
  DownloadOutlined,
  RightCircleOutlined,
} from '@ant-design/icons';
import { Form, Select, Table as TableD } from 'antd';
import { SizeType } from 'antd/lib/config-provider/SizeContext';
import { TablePaginationConfig } from 'antd/lib/table';
import React from 'react';
import { DeferFn, useAsync } from 'react-async';
import { fetchDatasetFiles, openDownloadURL } from '../../api';
import { formatBytes, splitStringByChar } from '../../common/utils';
import ToolTip from '../DataDisplay/ToolTip';
import Alert from '../Feedback/Alert';
import Button from '../General/Button';
import {
  Pagination,
  RawSearchResult,
  RawSearchResults,
  TextInputs,
} from './types';

export type DownloadUrls = {
  downloadType: string | undefined;
  downloadUrl: string | undefined;
}[];
type FileDownloadTypes = 'HTTPServer' | 'OpeNDAP' | 'Globus';

/**
 * Splits the string by a delimiter and pops the last string
 */
export const genDownloadUrls = (urls: string[]): DownloadUrls => {
  const newUrls: DownloadUrls = [];
  urls.forEach((url) => {
    const downloadType = url.split('|').pop();
    let downloadUrl = splitStringByChar(url, '|', '0') as string;

    // Chrome blocks Mixed Content (HTTPS to HTTP) downloads and the index
    // serves HTTP links
    // https://blog.chromium.org/2020/02/protecting-users-from-insecure.html
    if (downloadType === 'HTTPServer' && !downloadUrl.includes('https')) {
      downloadUrl = downloadUrl.replace('http', 'https');
    }

    if (downloadType === 'OPeNDAP') {
      downloadUrl = downloadUrl.replace('.html', '.dods');
    }
    newUrls.push({ downloadType, downloadUrl });
  });
  return newUrls;
};
export type Props = {
  id: string;
  numResults?: number;
  filenameVars?: TextInputs | [];
};

const FilesTable: React.FC<Props> = ({ id, numResults = 0, filenameVars }) => {
  // Add options to this constant as needed.
  // This variable populates the download drop downs and is used in conditionals.
  // TODO: Add 'Globus' during Globus integration process.
  const allowedDownloadTypes: FileDownloadTypes[] = ['HTTPServer', 'OpeNDAP'];
  const metadataKeysToDisplay = [
    'cf_standard_name',
    'checksum_type',
    'dataset_id',
    'id',
    'instance_id',
    'master_id',
    'timestamp',
    'variable',
    'variable_id',
    'variable_long_name',
    'variable_units',
    'version',
  ];

  const [paginationOptions, setPaginationOptions] = React.useState<Pagination>({
    page: 1,
    pageSize: 10,
  });

  const { data, error, isLoading, run: runFetchDatasetFiles } = useAsync({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    deferFn: (fetchDatasetFiles as unknown) as DeferFn<Record<string, any>>,
    id,
    paginationOptions,
    filenameVars,
  });

  React.useEffect(() => {
    runFetchDatasetFiles();
  }, [runFetchDatasetFiles, id, paginationOptions, filenameVars]);

  const handlePageChange = (page: number, pageSize: number): void => {
    setPaginationOptions({ page, pageSize });
  };

  const handlePageSizeChange = (pageSize: number): void => {
    setPaginationOptions({ page: 1, pageSize });
  };

  if (error) {
    return (
      <Alert
        message="Error"
        description="There was an issue fetching files for this dataset. Please contact support for assistance or try again later."
        type="error"
        showIcon
      />
    );
  }

  let docs: RawSearchResults | [] = [];
  if (data) {
    docs = (data as {
      response: { docs: RawSearchResults };
    }).response.docs;
  }

  const tableConfig = {
    dataSource: docs,
    size: 'small' as SizeType,
    loading: isLoading,
    rowKey: 'id',
    scroll: { y: 1000 },
    pagination: {
      total: numResults,
      position: ['bottomCenter'],
      showSizeChanger: true,
      onChange: (page: number, pageSize: number) =>
        handlePageChange(page, pageSize),
      onShowSizeChange: (_current: number, size: number) =>
        handlePageSizeChange(size),
    } as TablePaginationConfig,
    expandable: {
      expandedRowRender: (record: RawSearchResult) => {
        return Object.keys(record).map((key) => {
          if (metadataKeysToDisplay.includes(key)) {
            return (
              <p key={key} style={{ margin: 0 }}>
                <span style={{ fontWeight: 'bold' }}>{key}</span>: {record[key]}
              </p>
            );
          }
          return null;
        });
      },

      expandIcon: ({
        expanded,
        onExpand,
        record,
      }: {
        expanded: boolean;
        onExpand: (
          rowRecord: RawSearchResult,
          e: React.MouseEvent<HTMLSpanElement, MouseEvent>
        ) => void;
        record: RawSearchResult;
      }): React.ReactElement =>
        expanded ? (
          <DownCircleOutlined onClick={(e) => onExpand(record, e)} />
        ) : (
          <ToolTip title="View this file's metadata" trigger="hover">
            <RightCircleOutlined onClick={(e) => onExpand(record, e)} />
          </ToolTip>
        ),
    },
  };

  const columns = [
    {
      title: 'File Title',
      dataIndex: 'title',
      size: 400,
      key: 'title',
    },
    {
      title: 'Size',
      dataIndex: 'size',
      width: 100,
      key: 'size',
      render: (size: number) => {
        return formatBytes(size);
      },
    },
    {
      title: 'Download',
      key: 'download',
      width: 200,
      render: (record: { url: string[] }) => {
        const downloadUrls = genDownloadUrls(record.url);

        return (
          <span>
            <Form
              data-testid="download-form"
              layout="inline"
              onFinish={({ download }) => openDownloadURL(download)}
              initialValues={{ download: downloadUrls[0].downloadUrl }}
            >
              <Form.Item name="download">
                <Select style={{ width: 120 }}>
                  {downloadUrls.map(
                    (option) =>
                      allowedDownloadTypes.includes(
                        option.downloadType as FileDownloadTypes
                      ) && (
                        <Select.Option
                          key={option.downloadType}
                          value={option.downloadUrl as React.ReactText}
                        >
                          {option.downloadType}
                        </Select.Option>
                      )
                  )}
                </Select>
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<DownloadOutlined />}
                ></Button>
              </Form.Item>
            </Form>
          </span>
        );
      },
    },
    {
      title: 'Checksum',
      dataIndex: 'checksum',
      key: 'checksum',
    },
  ];

  return <TableD data-testid="filesTable" {...tableConfig} columns={columns} />;
};

export default FilesTable;
