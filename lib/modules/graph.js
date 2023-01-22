import chalk from 'chalk';
import { DepGraph } from 'dependency-graph';
import { getPackages } from '@manypkg/get-packages';

export const findPackages = async (path) => {
    if (!path) return console.error(`❌ ${chalk.red('Workspace path is required')}`);
    return getPackages(path).catch(() => {
        console.error(`❌ ${chalk.red('Could not find package.json')}`);
        return {};
    });
}

export const generateDependencyGraph = async (packages = [], excluded = []) => {
    const names = packages.map(({ packageJson }) => packageJson.name);
    const generatedDependencies = {};
    const graph = new DepGraph();

    packages.filter(({ packageJson }) => !excluded.includes(packageJson.name))
        .forEach(({ packageJson }) => {
            const { name } = packageJson;
            graph.addNode(name, packageJson);

            const dependencies = packageJson.dependencies || {};
            const peerDependencies = packageJson.peerDependencies || {};
            const devDependencies = packageJson.devDependencies || {};

            [dependencies, devDependencies, peerDependencies].forEach((entry) => {
                return Object.entries(entry).forEach(([dependency]) => {
                    if (names.includes(dependency)) {
                        graph.addNode(dependency);
                        graph.addDependency(name, dependency);
                    }
                });
            });

            generatedDependencies[name] = graph.dependenciesOf(name).filter((pkg) => {
                return names.includes(pkg);
            });
        });

    return {
        order: parseOrderedPackages(graph.overallOrder(), packages),
        dependencies: generatedDependencies
    };
}

export const outputGraph = (dependencies = {}, order = []) => {
    const entries = Object.entries(dependencies);

    entries.forEach(([name, deps]) => {
        const pkg = order.find((entry) => entry.name === name);
        console.log(`‣ ${chalk.green(name)} ${chalk.gray(`@ v${pkg.version}`)}`);

        deps.forEach(dependency => console.log(`   ${chalk.gray(dependency)}`));
    });
}

export const outputExecutionOrder = (order = []) => {
    order.forEach(pkg => console.log(`‣ ${chalk.green(pkg.name)}`));
}

const parseOrderedPackages = (order = [], packages = []) => {
    return order.map((item) => {
        const { packageJson, dir } = packages.find((pkg) => pkg.packageJson.name === item);
        const { name, scripts, version } = packageJson || {};

        return { name, scripts, version, directory: dir };
    });
}