import {
  BookOutlined,
  ExportOutlined,
  ShoppingCartOutlined,
} from '@ant-design/icons';
import { Col, Row, Typography } from 'antd';
import humps from 'humps';
import React from 'react';
import { DeferFn, useAsync } from 'react-async';
import { fetchSearchResults, generateSearchURLQuery } from '../../api';
import { clickableRoute } from '../../api/routes';
import { CSSinJS } from '../../common/types';
import { objectIsEmpty } from '../../common/utils';
import { UserCart } from '../Cart/types';
import { Tag, TagType } from '../DataDisplay/Tag';
import {
  ActiveFacets,
  DefaultFacets,
  ParsedFacets,
  RawFacets,
  RawProject,
} from '../Facets/types';
import Alert from '../Feedback/Alert';
import Button from '../General/Button';
import { NodeStatusArray } from '../NodeStatus/types';
import Table from './Table';
import {
  ActiveSearchQuery,
  RawSearchResult,
  RawSearchResults,
  TextInputs,
} from './types';

const styles: CSSinJS = {
  summary: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
    marginBottom: 10,
  },
  subtitles: { fontWeight: 'bold' },
  facetTag: { fontWeight: 'bold' },
  resultsHeader: { fontWeight: 'bold' },
  filtersContainer: {
    marginBottom: 10,
  },
};
/**
 * Joins adjacent elements of the facets obj into a tuple using reduce().
 * https://stackoverflow.com/questions/37270508/javascript-function-that-converts-array-to-array-of-2-tuples
 */
export const parseFacets = (facets: RawFacets): ParsedFacets => {
  const res = (facets as unknown) as ParsedFacets;
  const keys: string[] = Object.keys(facets);

  keys.forEach((key) => {
    res[key] = res[key].reduce((r, a, i) => {
      if (i % 2) {
        r[r.length - 1].push((a as unknown) as number);
      } else {
        r.push([a] as never);
      }
      return r;
    }, ([] as unknown) as [string, number][]);
  });
  return res;
};

/**
 * Stringifies the active filters to output in a formatted structure.
 * Example: '(Text Input = 'Solar') AND (source_type = AER OR AOGCM OR BGC)'
 */
export const stringifyFilters = (
  defaultFacets: DefaultFacets,
  activeFacets: ActiveFacets | Record<string, unknown>,
  textInputs: TextInputs | []
): string => {
  const strFilters: string[] = [];

  Object.keys(defaultFacets).forEach((key: string) => {
    strFilters.push(`(${key} = ${defaultFacets[key].toString()})`);
  });

  if (textInputs.length > 0) {
    strFilters.push(`(Text Input = ${textInputs.join(' OR ')})`);
  }

  if (!objectIsEmpty(activeFacets)) {
    Object.keys(activeFacets).forEach((key: string) => {
      strFilters.push(
        `(${humps.decamelize(key)} = ${(activeFacets as ActiveFacets)[key].join(
          ' OR '
        )})`
      );
    });
  }

  const strResult = `${strFilters.join(' AND ')}`;
  return strResult;
};

export const checkFiltersExist = (
  activeFacets: ActiveFacets | Record<string, unknown>,
  textInputs: TextInputs
): boolean => {
  return !(objectIsEmpty(activeFacets) && textInputs.length === 0);
};

export type Props = {
  activeSearchQuery: ActiveSearchQuery;
  defaultFacets: DefaultFacets;
  userCart: UserCart | [];
  nodeStatus?: NodeStatusArray;
  onRemoveFilter: (removedTag: TagType, type: string) => void;
  onClearFilters: () => void;
  onUpdateCart: (
    selectedItems: RawSearchResults,
    operation: 'add' | 'remove'
  ) => void;
  onUpdateAvailableFacets: (parsedFacets: ParsedFacets) => void;
  onSaveSearchQuery: (url: string) => void;
};

const Search: React.FC<Props> = ({
  activeSearchQuery,
  defaultFacets,
  userCart,
  nodeStatus,
  onRemoveFilter,
  onClearFilters,
  onUpdateCart,
  onUpdateAvailableFacets,
  onSaveSearchQuery,
}) => {
  const { data: results, error, isLoading, run } = useAsync({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    deferFn: (fetchSearchResults as unknown) as DeferFn<Record<string, any>>,
  });

  const [filtersExist, setFiltersExist] = React.useState<boolean>(false);
  const [parsedFacets, setParsedFacets] = React.useState<
    ParsedFacets | Record<string, unknown>
  >({});
  const [currentRequestURL, setCurrentRequestURL] = React.useState<
    string | null
  >(null);
  const [selectedItems, setSelectedItems] = React.useState<
    RawSearchResults | []
  >([]);
  const [paginationOptions, setPaginationOptions] = React.useState<{
    page: number;
    pageSize: number;
  }>({
    page: 1,
    pageSize: 10,
  });

  // Generate the current request URL based on filters
  React.useEffect(() => {
    if (!objectIsEmpty(activeSearchQuery.project)) {
      const reqUrl = generateSearchURLQuery(
        (activeSearchQuery.project as RawProject).facetsUrl,
        defaultFacets,
        activeSearchQuery.activeFacets,
        activeSearchQuery.textInputs,
        paginationOptions
      );
      setCurrentRequestURL(reqUrl);
    }
  }, [
    activeSearchQuery.project,
    activeSearchQuery,
    defaultFacets,
    paginationOptions,
  ]);

  React.useEffect(() => {
    setFiltersExist(
      checkFiltersExist(
        activeSearchQuery.activeFacets,
        activeSearchQuery.textInputs
      )
    );
  }, [activeSearchQuery.activeFacets, activeSearchQuery.textInputs]);

  // Fetch search results
  React.useEffect(() => {
    if (!objectIsEmpty(activeSearchQuery.project) && currentRequestURL) {
      run(currentRequestURL);
    }
  }, [run, currentRequestURL, activeSearchQuery.project]);

  // Update the available facets based on the returned results
  React.useEffect(() => {
    if (results && !objectIsEmpty(results)) {
      const { facet_fields: facetFields } = (results as {
        facet_counts: { facet_fields: RawFacets };
      }).facet_counts;
      setParsedFacets(parseFacets(facetFields));
    }
  }, [results]);

  React.useEffect(() => {
    onUpdateAvailableFacets(parsedFacets as ParsedFacets);
  }, [parsedFacets, onUpdateAvailableFacets]);

  const handleRowSelect = (selectedRows: RawSearchResults | []): void => {
    // If you select rows on one page of the table, then go to another page
    // and select more rows, the rows from the previous page transform from
    // objects to undefined in the array. To work around this, filter out the
    // undefined values.
    // https://github.com/ant-design/ant-design/issues/24243
    const rows = (selectedRows as RawSearchResults).filter(
      (row: RawSearchResult) => row !== undefined
    );
    setSelectedItems(rows);
  };

  const handlePageChange = (page: number, pageSize: number): void => {
    setPaginationOptions({ page, pageSize });
  };

  const handlePageSizeChange = (pageSize: number): void => {
    setPaginationOptions({ page: 1, pageSize });
  };

  if (error) {
    return (
      <div data-testid="alert-fetching">
        <Alert
          message="There was an issue fetching search results. Please contact support or try again later."
          type="error"
        />
      </div>
    );
  }

  let numFound = 0;
  let docs: RawSearchResults = [];
  if (results) {
    numFound = (results as { response: { numFound: number } }).response
      .numFound;
    docs = (results as { response: { docs: RawSearchResults } }).response.docs;
  }

  const allSelectedItemsInCart =
    selectedItems.filter(
      (item: RawSearchResult) =>
        !userCart.some((dataset: RawSearchResult) => dataset.id === item.id)
    ).length === 0;

  return (
    <div data-testid="search">
      <div style={styles.summary}>
        {objectIsEmpty(activeSearchQuery.project) && (
          <Alert
            message="Select a project to search for results"
            type="info"
            showIcon
          />
        )}
        <h3>
          {isLoading && (
            <span style={styles.resultsHeader}>
              Loading latest results for{' '}
            </span>
          )}
          {results && !isLoading && (
            <span style={styles.resultsHeader}>
              {numFound.toLocaleString()} results found for{' '}
            </span>
          )}
          <span style={styles.resultsHeader}>
            {(activeSearchQuery.project as RawProject).name}
          </span>
        </h3>
        <div>
          {results && (
            <div>
              <Button
                type="default"
                onClick={() => onUpdateCart(selectedItems, 'add')}
                disabled={
                  isLoading ||
                  numFound === 0 ||
                  selectedItems.length === 0 ||
                  allSelectedItemsInCart
                }
              >
                <ShoppingCartOutlined />
                Add Selected to Cart
              </Button>{' '}
              <Button
                type="default"
                onClick={() => onSaveSearchQuery(currentRequestURL as string)}
                disabled={isLoading || numFound === 0}
              >
                <BookOutlined />
                Save Search
              </Button>
            </div>
          )}
        </div>
      </div>
      <div>
        {results && (
          <>
            <p>
              <span style={styles.subtitles}>Query String: </span>
              <Typography.Text code>
                {stringifyFilters(
                  defaultFacets,
                  activeSearchQuery.activeFacets,
                  activeSearchQuery.textInputs
                )}
              </Typography.Text>
            </p>
          </>
        )}
      </div>

      {results && (
        <Row style={styles.filtersContainer}>
          {Object.keys(activeSearchQuery.activeFacets).length !== 0 &&
            Object.keys(activeSearchQuery.activeFacets).map((facet: string) => {
              return (activeSearchQuery.activeFacets as ActiveFacets)[
                facet
              ].map((variable: string) => {
                return (
                  <div key={variable} data-testid={variable}>
                    <Tag
                      value={[facet, variable]}
                      onClose={onRemoveFilter}
                      type="facet"
                    >
                      {variable}
                    </Tag>
                  </div>
                );
              });
            })}
          {activeSearchQuery.textInputs.length !== 0 &&
            (activeSearchQuery.textInputs as TextInputs).map(
              (input: string) => {
                return (
                  <div key={input} data-testid={input}>
                    <Tag value={input} onClose={onRemoveFilter} type="text">
                      {input}
                    </Tag>
                  </div>
                );
              }
            )}
          {filtersExist && (
            <Tag
              value="clearAll"
              color="#f50"
              type="close all"
              onClose={() => onClearFilters()}
            >
              Clear All
            </Tag>
          )}
        </Row>
      )}

      <Row gutter={[24, 16]} justify="space-around">
        <Col lg={24}>
          <div data-testid="search-table">
            {results && !isLoading ? (
              <Table
                loading={false}
                results={docs}
                totalResults={numFound}
                userCart={userCart}
                nodeStatus={nodeStatus}
                onUpdateCart={onUpdateCart}
                onRowSelect={handleRowSelect}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            ) : (
              <Table
                loading={isLoading}
                results={[]}
                totalResults={paginationOptions.pageSize}
                userCart={userCart}
                onUpdateCart={onUpdateCart}
              />
            )}
          </div>
        </Col>
        {results && currentRequestURL && (
          <Button
            type="default"
            href={clickableRoute(currentRequestURL)}
            target="_blank"
            icon={<ExportOutlined />}
          >
            Open as JSON
          </Button>
        )}
      </Row>
    </div>
  );
};

export default Search;
