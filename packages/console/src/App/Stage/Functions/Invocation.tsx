import { Link } from "react-router-dom";
import { Anchor, Badge, JsonView, Row, Spacer, Stack } from "~/components";
import { useFunctionInvoke } from "~/data/aws";
import { styled, keyframes } from "~/stitches.config";
import type { Invocation } from "../../../../../core/src/local/router";
import type { FunctionMetadata } from "../../../../../resources/src/Metadata";

type Props = {
  invocation: Invocation;
  metadata: FunctionMetadata;
  showSource?: boolean;
};

export function InvocationRow(props: Props) {
  return (
    <Row alignVertical="start">
      {props.showSource && (
        <>
          <Source {...props} />
          <Spacer horizontal="lg" />
        </>
      )}
      <Status invocation={props.invocation} />
      <Spacer horizontal="lg" />
      <Logs metadata={props.metadata} invocation={props.invocation} />
    </Row>
  );
}

const SourceRoot = styled(Anchor, {
  wordWrap: "break-word",
  width: 150,
  fontSize: "$sm",
  flexShrink: 0,
  lineHeight: 1.5,
});

function Source(props: Props) {
  const content = (() => {
    const http = props.invocation.request.requestContext?.http;
    if (http) return http.method + " " + http.path;
    return props.metadata.id;
  })();
  return (
    <SourceRoot
      as={Link}
      to={`../functions/${props.metadata.stack}/${props.metadata.addr}`}
    >
      {content}
    </SourceRoot>
  );
}

const StatusRoot = styled("div", {
  width: 100,
  flexShrink: 0,
  "& > *": {
    width: "100%",
  },
});

type StatusProps = {
  invocation: Invocation;
};

export function Status(props: StatusProps) {
  const { invocation } = props;
  if (!invocation.response)
    return (
      <StatusRoot>
        <Badge size="sm" color="neutral">
          Pending
        </Badge>
      </StatusRoot>
    );

  return (
    <StatusRoot>
      <Stack space="sm" alignHorizontal="stretch">
        {invocation.response.type === "failure" && (
          <Badge size="sm" color="danger">
            Error
          </Badge>
        )}
        {invocation.response.type === "timeout" && (
          <Badge size="sm" color="danger">
            Timeout
          </Badge>
        )}
        {invocation.response.type === "success" && (
          <Badge size="sm" color="success">
            Success
          </Badge>
        )}
      </Stack>
    </StatusRoot>
  );
}

const LogRow = styled("div", {
  fontSize: "$sm",
  lineHeight: 1.5,
  borderBottom: "1px solid $border",
  padding: "$sm 0",
  display: "flex",
  "&:first-child": {
    paddingTop: 0,
  },
  "&:last-child": {
    border: 0,
    paddingBottom: 0,
  },
  gap: "$md",

  "& > *:first-child": {
    flexBasis: "120px",
    flexShrink: 0,
  },
});

const LogTimestamp = styled("div", {});

const LogMessage = styled("div", {
  flexGrow: 1,
  whiteSpace: "pre-wrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
});

const LogStackTrace = styled("div", {
  padding: "$md $lg",
  borderRadius: 6,
  background: "$orange3",
  color: "$orange12",
  lineHeight: 2,
});

const LogDuration = styled("div", {
  flexShrink: 0,
  display: "none",
});

type LogsProps = {
  invocation: Invocation;
  metadata: FunctionMetadata;
};

const LogsRoot = styled("div", {
  flexGrow: 1,
  overflow: "hidden",
});

function Logs(props: LogsProps) {
  return (
    <LogsRoot>
      <LogRow>
        <LogTimestamp>
          {new Date(props.invocation.times.start).toISOString().split("T")[1]}
        </LogTimestamp>
        {typeof props.invocation.request === "string" ? (
          props.invocation.request
        ) : (
          <Row alignHorizontal="justify">
            <JsonView.Root>
              <JsonView.Content name="Request" src={props.invocation.request} />
            </JsonView.Root>
            <Replay invocation={props.invocation} metadata={props.metadata} />
          </Row>
        )}
      </LogRow>
      {props.invocation.logs.map((item) => (
        <LogRow key={item.timestamp}>
          <LogTimestamp>
            {new Date(item.timestamp).toISOString().split("T")[1]}
          </LogTimestamp>
          <LogMessage>{item.message}</LogMessage>
          <LogDuration>
            {item.timestamp - props.invocation.times.start}ms
          </LogDuration>
        </LogRow>
      ))}
      {props.invocation.response?.type === "failure" && (
        <LogRow>
          <LogTimestamp>
            {new Date(props.invocation.times.end!).toISOString().split("T")[1]}
          </LogTimestamp>
          <LogStackTrace>
            {props.invocation.response.error.stackTrace.length === 0 &&
              props.invocation.response.error.errorMessage}
            {props.invocation.response.error.stackTrace.map((item, index) => (
              <div key={index}>{item}</div>
            ))}
          </LogStackTrace>
        </LogRow>
      )}
      {props.invocation.response?.type === "success" && (
        <LogRow>
          <LogTimestamp>
            {new Date(props.invocation.times.end!).toISOString().split("T")[1]}
          </LogTimestamp>
          <JsonView.Root>
            <JsonView.Content
              name="Response"
              src={props.invocation.response.data}
            />
          </JsonView.Root>
        </LogRow>
      )}
    </LogsRoot>
  );
}

type ReplayProps = {
  metadata: FunctionMetadata;
  invocation: Invocation;
};

export function Replay(props: ReplayProps) {
  const invoke = useFunctionInvoke();
  return (
    <Anchor
      onClick={() =>
        invoke.mutate({
          arn: props.metadata.data.arn,
          payload: props.invocation.request,
        })
      }
    >
      Replay
    </Anchor>
  );
}