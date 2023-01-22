import chalk from 'chalk';
import { DepGraph } from 'dependency-graph';
import { getPackages } from '@manypkg/get-packages';

export class DependencyGraph {
    #path;
    #packages = [];
    #order = [];
    #dependencies = {};

    constructor(path) {
        this.#path = path;
    }

    async findPackages() {
        const { packages } = await getPackages(this.#path).catch(() => {
            console.error(`❌ ${chalk.red('Could not any package')}`);
            return { packages: [] };
        });

        this.#packages = packages;
    }

    getGraph() {
        return {
            order: this.#order,
            dependencies: this.#dependencies
        };
    }

    async generate(excluded = []) {
        const names = this.#packages.map(({ packageJson }) => packageJson.name);
        const generatedDependencies = {};
        const graph = new DepGraph({ circular: true });
    
        this.#packages.filter(({ packageJson }) => !excluded.includes(packageJson.name))
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

        this.#order = this.#parseOrder(graph.overallOrder());
        this.#dependencies = generatedDependencies;
    }

    printOrder() {
        this.#order.forEach(pkg => console.log(`‣ ${chalk.green(pkg.name)}`));
    }

    printGraph() {
        const entries = Object.entries(this.#dependencies);

        entries.forEach(([name, dependencies]) => {
            const pkg = this.#order.find((entry) => entry.name === name);
            console.log(`‣ ${chalk.green(name)} ${pkg && chalk.gray(`@ v${pkg.version}`)}`);
    
            dependencies.forEach(dependency => console.log(`   ${chalk.gray(dependency)}`));
        });
    }

    #parseOrder(order = []) {
        return order.map((item) => {
            const { packageJson, dir } = this.#packages.find((pkg) => pkg.packageJson.name === item);
            const { name, scripts, version } = packageJson || {};
    
            return { name, scripts, version, directory: dir };
        });
    }
}
