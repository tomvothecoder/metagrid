import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  Switch,
} from 'react-router-dom';
import { Breadcrumb, Layout, message } from 'antd';
import { HomeOutlined } from '@ant-design/icons';

import NavBar from './components/NavBar';
import Facets from './components/Facets';
import Search from './components/Search';
import Cart from './components/Cart';
import Summary from './components/Cart/Summary';

import { isEmpty } from './utils/utils';
import './App.css';

const styles = {
  bodyLayout: { padding: '24px 0' },
  bodySider: {
    background: '#fff',
    padding: '25px 25px 25px 25px',
    marginLeft: '25px',
    width: '350',
  },
  bodyContent: { padding: '0 24px' },
  footer: { textAlign: 'center' },
};

function App() {
  const [activeProject, setActiveProject] = React.useState({});
  const [availableFacets, setAvailableFacets] = React.useState({});
  const [textInputs, setTextInputs] = React.useState([]);
  const [activeFacets, setActiveFacets] = React.useState({});
  const [cart, setCart] = React.useState([]);

  /**
   * Handles clearing constraints for a selected project.
   */
  const clearConstraints = () => {
    setTextInputs([]);
    setActiveFacets({});
  };

  /**
   * Handles when the selected project changes.
   *
   * This functions checks if the current project is not an empty object or
   * equal to the selected project to reset textInputs and activeFacets, then
   * it updates the selected project.
   * @param {*} selectedProject
   */
  const handleProjectChange = (selectedProject) => {
    if (!isEmpty(activeProject) && activeProject !== selectedProject) {
      clearConstraints();
    }

    setActiveProject(selectedProject);
  };

  /**
   * Handles removing applied tags.
   * @param {string} removedTag
   */
  const handleRemoveTag = (removedTag, type) => {
    /* istanbul ignore else */
    if (type === 'text') {
      setTextInputs(() => textInputs.filter((input) => input !== removedTag));
    } else if (type === 'facet') {
      const updateFacet = {
        [removedTag[0]]: activeFacets[removedTag[0]].filter(
          (item) => item !== removedTag[1]
        ),
      };
      setActiveFacets({ ...activeFacets, ...updateFacet });
    } else {
      throw new Error(
        `handleRemoveTag does not support argument 'type' of value ${type}`
      );
    }
  };

  /**
   * Handles adding or removing items from the cart.
   * @param {arrayOf(objectOf(any))} selectedItems
   */
  const handleCart = (selectedItems, operation) => {
    /* istanbul ignore else */
    if (operation === 'add') {
      setCart(() => {
        const itemsNotInCart = selectedItems.filter((item) => {
          return !cart.includes(item);
        });
        return [...cart, ...itemsNotInCart];
      });
      message.success('Added items to the cart');
    } else if (operation === 'remove') {
      setCart(
        cart.filter((item) => {
          return !selectedItems.includes(item);
        })
      );
      message.error('Removed items from the cart');
    } else {
      throw new Error(
        `handleCart does not support argument 'operation' of value ${operation}`
      );
    }
  };

  /**
   * Handles free-text search form submission.
   *
   * @param {string} input - free-text input to query for search results
   */
  const handleOnSearch = (input) => {
    if (textInputs.includes(input)) {
      message.error(`Input "${input}" has already been applied`);
    } else {
      setTextInputs([...textInputs, input]);
    }
  };

  const handleSetAvailableFacets = (facets) => {
    setAvailableFacets(facets);
  };

  return (
    <Router>
      <Switch>
        <Redirect from="/" exact to="/search" />
      </Switch>
      <div>
        <Route
          path="/"
          render={() => (
            <NavBar
              activeProject={activeProject}
              cartItems={cart.length}
              onProjectChange={(value) => handleProjectChange(value)}
              onSearch={(input) => handleOnSearch(input)}
            ></NavBar>
          )}
        />
        <Layout id="body-layout" style={styles.bodyLayout}>
          <Switch>
            <Route
              path="/search"
              render={() => (
                <Layout.Sider
                  style={styles.bodySider}
                  width={styles.bodySider.width}
                >
                  <Facets
                    activeProject={activeProject}
                    activeFacets={activeFacets}
                    availableFacets={availableFacets}
                    handleProjectChange={handleProjectChange}
                    onSetActiveFacets={(facets) => setActiveFacets(facets)}
                  />
                </Layout.Sider>
              )}
            />
            <Route
              path="/cart"
              render={() => (
                <Layout.Sider
                  style={styles.bodySider}
                  width={styles.bodySider.width}
                >
                  <Summary
                    numItems={cart.length}
                    numFiles={
                      cart.length > 0
                        ? cart.reduce(
                            (acc, dataset) => acc + dataset.number_of_files,
                            0
                          )
                        : 0
                    }
                  />
                </Layout.Sider>
              )}
            />
          </Switch>
          <Layout.Content style={styles.bodyContent}>
            <Switch>
              <Route
                path="/search"
                render={() => (
                  <>
                    <Breadcrumb>
                      <Breadcrumb.Item>
                        <HomeOutlined /> Home
                      </Breadcrumb.Item>
                      <Breadcrumb.Item>Search</Breadcrumb.Item>
                    </Breadcrumb>
                    <Search
                      activeProject={activeProject}
                      setAvailableFacets={(facets) =>
                        handleSetAvailableFacets(facets)
                      }
                      textInputs={textInputs}
                      activeFacets={activeFacets}
                      cart={cart}
                      handleCart={handleCart}
                      onRemoveTag={(removedTag, type) =>
                        handleRemoveTag(removedTag, type)
                      }
                      onClearTags={() => clearConstraints()}
                    ></Search>
                  </>
                )}
              />
              <Route
                path="/cart"
                render={() => (
                  <>
                    <Breadcrumb>
                      <Breadcrumb.Item>
                        <HomeOutlined /> Home
                      </Breadcrumb.Item>
                      <Breadcrumb.Item>Cart</Breadcrumb.Item>
                    </Breadcrumb>
                    <Cart
                      cart={cart}
                      handleCart={handleCart}
                      clearCart={() => setCart([])}
                    />
                  </>
                )}
              />
            </Switch>
          </Layout.Content>
        </Layout>
        <Layout.Footer data-testid="footer" style={styles.footer}>
          ESGF Search UI ©2020
        </Layout.Footer>
      </div>
    </Router>
  );
}

export default App;
