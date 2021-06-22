/*
 *
 * HomePage
 *
 */
/* eslint-disable */
import React, { memo } from "react";
import { FormattedMessage } from "react-intl";
import { get, upperFirst } from "lodash";
import { auth } from "strapi-helper-plugin";
import PageTitle from "../../components/PageTitle";

import { Block, Container, P, Wave } from "./components";

const HomePage = ({ global: { plugins }, history: { push } }) => {
  const headerId = "HomePage.greetings";
  const username = get(auth.getUserInfo(), "username", "");

  return (
    <>
      <FormattedMessage id="HomePage.helmet.title">
        {(title) => <PageTitle title={title} />}
      </FormattedMessage>
      <Container className="container-fluid">
        <div className="row">
          <div className="col-lg-8 col-md-12">
            <Block>
              <Wave />
              <FormattedMessage
                id={headerId}
                values={{
                  name: upperFirst(username),
                }}
              >
                {(msg) => <h2 id="mainHeader">{msg}</h2>}
              </FormattedMessage>
            </Block>
          </div>
        </div>
      </Container>
    </>
  );
};

export default memo(HomePage);
