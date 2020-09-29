import { Checkbox, Collapse, Form, Select } from 'antd';
import React from 'react';
import { CSSinJS } from '../../common/types';
import { ActiveFacets, DefaultFacets, ParsedFacets } from './types';

const styles: CSSinJS = {
  container: { maxHeight: '80vh', overflowY: 'auto' },
  facetCount: { float: 'right' },
  formTitle: { fontWeight: 'bold', textTransform: 'capitalize' },
  applyBtn: { marginBottom: '12px' },
  collapseContainer: { marginTop: '12px' },
};

export type Props = {
  facetsByGroup?: { [key: string]: string[] };
  defaultFacets: DefaultFacets;
  activeFacets: ActiveFacets | Record<string, unknown>;
  projectFacets: ParsedFacets;
  onValuesChange: (allValues: { [key: string]: string[] | [] }) => void;
};

/**
 * Converts facet names from snake_case to human readable.
 *
 * It also checks for acronyms to convert to uppercase.
 */
export const humanizeFacetNames = (str: string): string => {
  const acronyms = ['Id', 'Cf', 'Cmor', 'Mip'];
  const frags = str.split('_');

  for (let i = 0; i < frags.length; i += 1) {
    frags[i] = frags[i].charAt(0).toUpperCase() + frags[i].slice(1);

    if (acronyms.includes(frags[i])) {
      frags[i] = frags[i].toUpperCase();
    }
  }

  return frags.join(' ');
};

const FacetsForm: React.FC<Props> = ({
  facetsByGroup,
  defaultFacets,
  activeFacets,
  projectFacets,
  onValuesChange,
}) => {
  const [projectFacetsForm] = Form.useForm();

  /**
   * Need to reset the project facet form's fields whenever the active and default
   * facets change in order to capture the correct number of facet counts per option
   */
  React.useEffect(() => {
    projectFacetsForm.resetFields();
  }, [projectFacetsForm, activeFacets, defaultFacets]);

  return (
    <div data-testid="facets-form">
      <Form
        form={projectFacetsForm}
        layout="vertical"
        initialValues={{
          ...activeFacets,
          selectedDefaults: Object.keys(defaultFacets).filter(
            (k) => defaultFacets[k]
          ),
        }}
        onValuesChange={(_changedValues, allValues) => {
          onValuesChange(allValues);
        }}
      >
        <Form.Item name="selectedDefaults">
          <Checkbox.Group
            options={[{ label: 'Include Replica', value: 'replica' }]}
          ></Checkbox.Group>
        </Form.Item>
        <div style={styles.container}>
          {facetsByGroup &&
            Object.keys(facetsByGroup).map((group) => {
              return (
                <div key={group} style={styles.collapseContainer}>
                  <h4 style={styles.formTitle}>{group}</h4>
                  <Collapse>
                    {Object.keys(projectFacets).map((facet) => {
                      if (facetsByGroup[group].includes(facet)) {
                        const facetOptions = projectFacets[facet];
                        return (
                          <Collapse.Panel
                            header={humanizeFacetNames(facet)}
                            key={facet}
                            disabled={facetOptions.length === 0}
                          >
                            <Form.Item
                              style={{ marginBottom: '4px' }}
                              key={facet}
                              name={facet}
                            >
                              <Select
                                data-testid={`${facet}-form-select`}
                                size="small"
                                placeholder="Select option(s)"
                                mode="multiple"
                                style={{ width: '100%' }}
                                tokenSeparators={[',']}
                                showArrow
                              >
                                {facetOptions.map((variable) => {
                                  return (
                                    <Select.Option
                                      key={variable[0]}
                                      value={variable[0]}
                                    >
                                      <span
                                        data-testid={`${facet}_${variable[0]}`}
                                      >
                                        {variable[0]}
                                        <span style={styles.facetCount}>
                                          ({variable[1]})
                                        </span>
                                      </span>
                                    </Select.Option>
                                  );
                                })}
                              </Select>
                            </Form.Item>
                          </Collapse.Panel>
                        );
                      }
                      return null;
                    })}
                  </Collapse>
                </div>
              );
            })}
        </div>
      </Form>
    </div>
  );
};

export default FacetsForm;
