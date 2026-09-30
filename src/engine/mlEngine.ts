import { Transaction } from "../types";
import { RuleEvaluationResult } from "./auditRules";

export interface MLFeatureVector {
  txId: string;
  features: number[];
}

// Euler-Mascheroni constant
const EULER_MASCHERONI = 0.5772156649;

// Average path length of unsuccessful searches in a Binary Search Tree (BST)
function cFactor(n: number): number {
  if (n <= 1) return 1;
  if (n === 2) return 1;
  return 2 * (Math.log(n - 1) + EULER_MASCHERONI) - (2 * (n - 1)) / n;
}

interface IsolationTreeNode {
  isLeaf: boolean;
  size: number;
  splitFeature?: number;
  splitValue?: number;
  left?: IsolationTreeNode;
  right?: IsolationTreeNode;
}

class IsolationTree {
  root: IsolationTreeNode;
  maxDepth: number;

  constructor(data: number[][], currentDepth: number = 0, maxDepth: number = 10) {
    this.maxDepth = maxDepth;
    this.root = this.buildTree(data, currentDepth);
  }

  private buildTree(data: number[][], currentDepth: number): IsolationTreeNode {
    const numSamples = data.length;
    if (currentDepth >= this.maxDepth || numSamples <= 1) {
      return { isLeaf: true, size: numSamples };
    }

    const numFeatures = data[0].length;
    // Randomly select a feature that has non-identical values
    const featureIndices = Array.from({ length: numFeatures }, (_, i) => i);
    // Shuffle feature indices
    for (let i = featureIndices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [featureIndices[i], featureIndices[j]] = [featureIndices[j], featureIndices[i]];
    }

    let selectedFeature = -1;
    let minVal = 0;
    let maxVal = 0;

    for (const fIdx of featureIndices) {
      const colValues = data.map((d) => d[fIdx]);
      const min = Math.min(...colValues);
      const max = Math.max(...colValues);
      if (max > min) {
        selectedFeature = fIdx;
        minVal = min;
        maxVal = max;
        break;
      }
    }

    if (selectedFeature === -1) {
      return { isLeaf: true, size: numSamples };
    }

    // Pick uniform random split value
    const splitValue = minVal + Math.random() * (maxVal - minVal);

    const leftData = data.filter((d) => d[selectedFeature] < splitValue);
    const rightData = data.filter((d) => d[selectedFeature] >= splitValue);

    if (leftData.length === 0 || rightData.length === 0) {
      return { isLeaf: true, size: numSamples };
    }

    return {
      isLeaf: false,
      size: numSamples,
      splitFeature: selectedFeature,
      splitValue,
      left: this.buildTree(leftData, currentDepth + 1),
      right: this.buildTree(rightData, currentDepth + 1),
    };
  }

  pathLength(point: number[], node: IsolationTreeNode = this.root, currentDepth: number = 0): number {
    if (node.isLeaf) {
      return currentDepth + (node.size > 1 ? cFactor(node.size) : 0);
    }

    if (node.splitFeature !== undefined && node.splitValue !== undefined) {
      if (point[node.splitFeature] < node.splitValue && node.left) {
        return this.pathLength(point, node.left, currentDepth + 1);
      } else if (node.right) {
        return this.pathLength(point, node.right, currentDepth + 1);
      }
    }

    return currentDepth;
  }
}

export class IsolationForestModel {
  trees: IsolationTree[] = [];
  numTrees: number;
  sampleSize: number;

  constructor(numTrees: number = 40, sampleSize: number = 128) {
    this.numTrees = numTrees;
    this.sampleSize = sampleSize;
  }

  fit(data: number[][]) {
    this.trees = [];
    const n = data.length;
    if (n === 0) return;

    const actualSampleSize = Math.min(this.sampleSize, n);
    const maxDepth = Math.ceil(Math.log2(Math.max(2, actualSampleSize)));

    for (let i = 0; i < this.numTrees; i++) {
      // Subsample without replacement
      const sampleIndices = new Set<number>();
      while (sampleIndices.size < actualSampleSize) {
        sampleIndices.add(Math.floor(Math.random() * n));
      }
      const sample = Array.from(sampleIndices).map((idx) => data[idx]);
      this.trees.push(new IsolationTree(sample, 0, maxDepth));
    }
  }

  predictAnomalyScore(point: number[], subSampleSize: number): number {
    if (this.trees.length === 0) return 50;

    let totalPathLength = 0;
    for (const tree of this.trees) {
      totalPathLength += tree.pathLength(point);
    }
    const avgPathLength = totalPathLength / this.trees.length;
    const c = cFactor(subSampleSize);

    // s(x, n) = 2^(-E(h(x)) / c(n))
    const s = Math.pow(2, -avgPathLength / c);

    // Rescale from [0, 1] to [0, 100], emphasizing anomalies (score > 0.5)
    // Points with s close to 1 are extreme outliers; points with s < 0.5 are normal
    const scaled = Math.max(0, Math.min(100, Math.round((s - 0.35) * 160)));
    return scaled;
  }
}

export function trainAndScoreAnomalies(
  transactions: Transaction[],
  ruleResults: Map<string, RuleEvaluationResult>
): Map<string, number> {
  const scores = new Map<string, number>();
  if (transactions.length === 0) return scores;

  // 1. Feature Engineering
  // Calculate standard stats for normalizations
  const amounts = transactions.map((t) => t.amount);
  const logAmounts = amounts.map((a) => Math.log10(Math.max(1, a)));
  const meanLogAmount = logAmounts.reduce((a, b) => a + b, 0) / logAmounts.length;
  const stdLogAmount = Math.sqrt(
    logAmounts.map((x) => Math.pow(x - meanLogAmount, 2)).reduce((a, b) => a + b, 0) / logAmounts.length
  ) || 1;

  const datasetVectors: { txId: string; features: number[] }[] = transactions.map((tx) => {
    const r = ruleResults.get(tx.transaction_id);
    const logAmt = Math.log10(Math.max(1, tx.amount));
    const zAmount = (logAmt - meanLogAmount) / stdLogAmount;

    const vendorRatio = r?.vendor_amount_ratio || 1;
    const deptRatio = r?.department_amount_ratio || 1;
    const isWeekendNum = r?.is_weekend ? 1 : 0;
    const isMonthEndNum = r?.is_month_end ? 1 : 0;
    const invFreq = r?.invoice_frequency || 1;

    const txDate = new Date(tx.date);
    const dayOfMonth = isNaN(txDate.getTime()) ? 15 : txDate.getDate();

    // Multidimensional numerical feature vector
    const features = [
      zAmount,
      vendorRatio,
      deptRatio,
      isWeekendNum,
      isMonthEndNum,
      invFreq,
      dayOfMonth / 31,
    ];

    return { txId: tx.transaction_id, features };
  });

  // 2. Fit Isolation Forest
  const dataMatrix = datasetVectors.map((v) => v.features);
  const model = new IsolationForestModel(45, Math.min(256, transactions.length));
  model.fit(dataMatrix);

  // 3. Score each observation
  const subSampleSize = Math.min(256, transactions.length);
  datasetVectors.forEach((item) => {
    const mlScore = model.predictAnomalyScore(item.features, subSampleSize);
    scores.set(item.txId, mlScore);
  });

  return scores;
}
